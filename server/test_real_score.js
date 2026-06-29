async function test() {
  const body = {
    resume: {
      personalInfo: { name: "Test User", phone: "123", email: "test@test.com", title: "Engineer" },
      summary: "This is a test summary for the resume",
      workExperience: [{
        company: "Company A",
        position: "Engineer",
        startDate: "2020-01",
        endDate: "2021-12",
        highlights: ["Built feature X", "Improved performance by 50%"]
      }],
      projectExperience: [],
      organizationExperience: [],
      education: [],
      awards: [],
      skills: []
    }
  };

  console.log('Sending request to http://localhost:3001/api/ai/score...');
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.log('Timeout after 8 seconds, aborting...');
    controller.abort();
  }, 8000);

  try {
    const response = await fetch('http://localhost:3001/api/ai/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:');
    for (const [key, value] of response.headers) {
      console.log(`  ${key}: ${value}`);
    }

    if (response.body) {
      const reader = response.body.getReader();
      let fullData = '';
      let i = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        fullData += text;
        console.log(`Chunk ${++i}: ${text.substring(0, 120).replace(/\n/g, '\\n')}`);
      }
      console.log('\nFull response (first 500 chars):', fullData.substring(0, 500));
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error('Error:', err.message, err.code);
  }
}

test();
