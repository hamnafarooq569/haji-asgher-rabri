export async function POST(req) {
  const body = await req.json();

  const message = `
New Order!

Name: ${body.name}
Phone: ${body.phone}

Items:
${body.items.map(i => `${i.name} x ${i.qty}`).join("\n")}

Total: Rs ${body.total}
`;

  await fetch("https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages", {
    method: "POST",
    headers: {
      Authorization: "Bearer YOUR_ACCESS_TOKEN",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "OWNER_NUMBER",
      type: "text",
      text: { body: message },
    }),
  });

  return Response.json({ success: true });
}