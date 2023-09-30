// Not working with axios (Blocked by Cloudflare)
// P.S. Why is that happens...

async function chatRequestTextAivvm(content) {
  try {
    const options = {
      method: "POST",
      body: JSON.stringify({
        model: { id: "gpt-3.5-turbo", name: "GPT-3.5" },
        messages: content,
      }),
    };

    const response = await fetch("https://chat.aivvm.com/api/chat", options);
    return await response.text();
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export { chatRequestTextAivvm };
