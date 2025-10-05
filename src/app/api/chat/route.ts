import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await req.json();
    const { message, files, history } = body;
    

    // Prepare the payload for n8n webhook
    const webhookPayload = {
      message: message || "",
      files: files || [],
      history: history || []
    };

    // Make POST request to n8n webhook
    const webhookUrl = 'https://n8n-pdc2.onrender.com/webhook/agent';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });
    console.log("This is the response from the webhook", response);

    // Check if the webhook request was successful
    if (!response.ok) {
      throw new Error(`Webhook request failed with status: ${response.status}`);
    }

    // Parse the response from n8n
    const data = await response.json();

    console.log('n8n response:', data);

    // Return the response to the client
    // Handle different possible response structures from n8n
    return NextResponse.json({
      success: true,
      message: data.output || data.message || data.response || data.text || "Response received",
      data: data
    });

  } catch (error) {
    console.error('Error in chat API route:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}