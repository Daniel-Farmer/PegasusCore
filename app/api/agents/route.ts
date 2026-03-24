import { createClient } from "@/lib/supabase/server";
import { createFlowiseClient } from "@/lib/flowise";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, chatflowId, sessionId } = await request.json();

  const flowId = chatflowId || process.env.FLOWISE_CHATFLOW_ID;
  if (!flowId) {
    return NextResponse.json(
      { error: "No chatflow ID configured" },
      { status: 400 }
    );
  }

  const flowise = createFlowiseClient();

  try {
    const response = await flowise.createPrediction({
      chatflowId: flowId,
      question,
      overrideConfig: {
        sessionId: sessionId || user.id,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Flowise request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
