fetch('http://localhost:3000/api/tasks?userId=test-user-id')
  .then(res => res.json())
  .then(data => console.log('RESPONSE:', data))
  .catch(err => console.error('ERROR:', err));
