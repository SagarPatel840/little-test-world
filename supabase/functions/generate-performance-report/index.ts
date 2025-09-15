import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
const azureDeployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT_NAME');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvFiles, reportName, aiProvider, projectId } = await req.json();

    if (!csvFiles || !Array.isArray(csvFiles) || csvFiles.length === 0) {
      throw new Error('CSV files are required');
    }

    if (!reportName || !aiProvider || !projectId) {
      throw new Error('Report name, AI provider, and project ID are required');
    }

    console.log(`Generating performance report using ${aiProvider}`);

    // Get user from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Prepare the analysis prompt
    const analysisPrompt = `You are acting as a Senior Performance Tester.
I will provide you with multiple CSV files containing performance test results from different runs.

Your tasks:
1. Analyze all the CSV files collectively.
2. Identify key performance metrics such as response time, throughput, error rate, latency, resource utilization, and trends across runs.
3. Highlight bottlenecks, anomalies, or significant variations between test runs.
4. Consolidate findings into a single final performance report that:
   - Summarizes overall system performance.
   - Compares and contrasts metrics across runs.
   - Highlights improvements, regressions, and stability issues.
   - Provides root cause insights where possible.
   - Gives actionable recommendations for developers and stakeholders.

Format the output report in a **professional, structured manner** with the following sections:
- **Executive Summary**
- **Key Observations & Trends**
- **Bottlenecks & Issues Identified**
- **Comparison Across Runs**
- **Recommendations & Next Steps**

Write the report as if you are delivering it to senior management and technical teams. Keep it detailed, insightful, and practical.

Here are the CSV file contents:

${csvFiles.map((file: any, index: number) => `
=== CSV File ${index + 1}: ${file.name} ===
${file.content}
`).join('\n')}`;

    let reportContent = '';

    if (aiProvider === 'gemini') {
      if (!googleApiKey) {
        throw new Error('Google AI API key not configured');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 4000,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        
        // Parse error response to provide better error messages
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.code === 429) {
            throw new Error('Gemini API quota exceeded. Please check your billing details or try again later.');
          } else if (errorData.error?.message) {
            throw new Error(`Gemini API error: ${errorData.error.message}`);
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      reportContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate report';

    } else if (aiProvider === 'azure-openai') {
      if (!azureApiKey || !azureEndpoint || !azureDeployment) {
        throw new Error('Azure OpenAI configuration not complete');
      }

      const response = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=2024-08-01-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureApiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a Senior Performance Testing Expert. Analyze the provided performance test data and generate comprehensive reports.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure OpenAI API error:', errorText);
        const err: any = new Error(`Azure OpenAI API error: ${response.status}`);
        err.status = response.status;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error?.message) err.message = `Azure OpenAI API error: ${parsed.error.message}`;
        } catch (_) {
          // ignore parse error
        }
        throw err;
      }

      const data = await response.json();
      reportContent = data.choices?.[0]?.message?.content || 'Failed to generate report';
    } else {
      throw new Error('Invalid AI provider specified');
    }

    // Save the report to database
    const { data: report, error: insertError } = await supabase
      .from('performance_reports')
      .insert({
        project_id: projectId,
        created_by: user.id,
        report_name: reportName,
        ai_provider: aiProvider,
        report_content: reportContent,
        csv_files_metadata: csvFiles.map((file: any) => ({
          name: file.name,
          size: file.size || 0,
          uploaded_at: new Date().toISOString()
        }))
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save report to database');
    }

    return new Response(JSON.stringify({
      success: true,
      report: {
        id: report.id,
        name: report.report_name,
        content: report.report_content,
        aiProvider: report.ai_provider,
        createdAt: report.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-performance-report function:', error);
    const status = typeof error?.status === 'number' ? error.status : 500;
    return new Response(JSON.stringify({ 
      success: false, 
      error: error?.message || 'Unexpected error',
      status
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});