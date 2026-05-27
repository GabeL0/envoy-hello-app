require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const express = require('express');
const { envoyMiddleware, errorMiddleware } = require('@envoy/envoy-integrations-sdk');
const app = express();
app.use(envoyMiddleware());

app.post('/hello-options', (req, res) => {
  res.send([
    { label: 'Hello', value: 'Hello' },
    { label: 'Hola', value: 'Hola' },
    { label: 'Aloha', value: 'Aloha' },
  ]);
});

app.post('/goodbye-options', (req, res) => {
  res.send([
    { label: 'Goodbye', value: 'Goodbye' },
    { label: 'Adios', value: 'Adios' },
    { label: 'Aloha', value: 'Aloha' },
  ]);
});
  
app.post('/visitor-sign-in', async (req, res) => {
  const envoy = req.envoy;
  const hello = envoy.meta.config.HELLO;
  const visitorName = envoy.payload.attributes['full-name'];
  const message = `${hello} ${visitorName}!`;
  await envoy.job.attach({ label: 'Hello', value: message });
  res.send({ hello });
});

app.post('/visitor-sign-out', async (req, res) => {
  const envoy = req.envoy;
  const goodbye = envoy.meta.config.GOODBYE;
  const visitorName = envoy.payload.attributes['full-name'];
  const hostEmail = envoy.payload.attributes['host-email'];
  const message = `${goodbye} ${visitorName}!`;
  await envoy.job.attach({ label: 'Goodbye', value: message });
    
  if (hostEmail) {
    const user = await slack.users.lookupByEmail({ email: hostEmail });
    await slack.chat.postMessage({
      channel: user.user.id,
      text: `Your visitor ${visitorName} has signed out.`,
    });
  } 
    
  res.send({ goodbye });
});

app.use(errorMiddleware());
const listener = app.listen(process.env.PORT || 0, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
