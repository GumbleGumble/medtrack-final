import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    throw new Error("Test error for Sentry");
  } catch (error) {
    // Capture and send error to Sentry
    Sentry.captureException(error);
    
    return new Response("Test error sent to Sentry", {
      status: 500,
    });
  }
} 