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
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = new TextDecoder().decode(value);
    
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6);
      
      if (payload === '[DONE]') {
        console.log('Stream completed');
        break;
      }
      
      try {
        const json = JSON.parse(payload);
        if (json.content) {
          accumulated += json.content;
        }
      } catch { }
    }
  }

  console.log('\nAccumulated content length:', accumulated.length);
  console.log('Accumulated content:', accumulated);
  
  // Try to parse as JSON
  try {
    const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('\nParsed JSON:');
      console.log(JSON.stringify(parsed, null, 2));
    }
  } catch (e) {
    console.error('Failed to parse JSON:', e.message);
  }
}

test().catch(err => console.error('Error:', err.message));
