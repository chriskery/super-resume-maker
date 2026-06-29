async function test() {
  const body = {
    resume: {
      personalInfo: { name: "Test", phone: "123", email: "test@test.com", title: "Engineer" },
      summary: "Test summary",
      workExperience: [],
      projectExperience: [],
      organizationExperience: [],
      education: [],
      awards: [],
      skills: []
    }
  };

  const response = await fetch('http://localhost:3001/api/ai/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const reader = response.body.getReader();
  let fullData = '';
  let thinkingCount = 0;
  let contentCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = new TextDecoder().decode(value);
    fullData += text;
    
    if (text.includes('thinking')) thinkingCount++;
    if (text.includes('"content"')) contentCount++;
  }

  console.log(`Total chunks with thinking: ${thinkingCount}`);
  console.log(`Total chunks with content: ${contentCount}`);
  console.log(`Full data length: ${fullData.length}`);
  console.log(`Contains [DONE]: ${fullData.includes('[DONE]')}`);
  console.log(`Last 500 chars of full data:\n${fullData.slice(-500)}`);
}

test().catch(err => console.error('Error:', err.message));
