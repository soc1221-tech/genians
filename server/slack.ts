import { WebClient } from "@slack/web-api";

if (!process.env.SLACK_BOT_TOKEN) {
  console.warn("SLACK_BOT_TOKEN environment variable not set - Slack notifications disabled");
}

if (!process.env.SLACK_CHANNEL_ID) {
  console.warn("SLACK_CHANNEL_ID environment variable not set - Slack notifications disabled");
}

const slack = process.env.SLACK_BOT_TOKEN ? new WebClient(process.env.SLACK_BOT_TOKEN) : null;

export async function sendLeaveRequestNotification(
  employeeName: string,
  startDate: string,
  endDate: string,
  reason: string,
  remainingBalance: number,
  days: number
): Promise<void> {
  if (!slack || !process.env.SLACK_CHANNEL_ID) {
    console.log("Slack not configured - would send notification:", {
      employeeName,
      startDate,
      endDate,
      reason,
      remainingBalance,
      days
    });
    return;
  }

  try {
    await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🏖️ New Leave Request",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Employee:*\n${employeeName}`
            },
            {
              type: "mrkdwn",
              text: `*Dates:*\n${startDate} to ${endDate}`
            },
            {
              type: "mrkdwn",
              text: `*Duration:*\n${days} day${days > 1 ? 's' : ''}`
            },
            {
              type: "mrkdwn",
              text: `*Remaining Balance:*\n${remainingBalance} days`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Reason:*\n${reason}`
          }
        }
      ]
    });
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}
