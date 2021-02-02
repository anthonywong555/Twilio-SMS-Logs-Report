require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const axios = require('axios').default;

const driver = async () => {
  try {
    const baseURL = baseURLGenerator();
    const messages = await recursive(baseURL);
    console.log(messages.length);
  } catch(e) {
    console.error(e);
  }
}

const baseURLGenerator = () => {
  const baseURL = `/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const urlParams = {
    DateSentAfter: null,
    DateSentBefore: null,
    DateSent: null,
    From: null,
    To: null,
    PageSize: 100
  };

  const params = Object.keys(urlParams).reduce((accumulator, aKey) => {
    if(urlParams[aKey]) {
      if(aKey === 'DateSentAfter') {
        return `${accumulator}&DateSent%3E=${urlParams[aKey]}`;
      } else if(aKey === 'DateSentBefore') {
        return `${accumulator}&DateSent%3C=${urlParams[aKey]}`;
      } else {
        return `${accumulator}&${aKey}=${encodeURIComponent(urlParams[aKey])}`;
      }
    }

    return accumulator;
  }, '');


  const url = `${baseURL}?${params.substring(1)}`;
  return url;
}

const recursive = async(nextPageUri, accumulator = []) => {
  try {
    const axiosResponse = await axios({
      method: 'GET',
      url: `https://api.twilio.com${nextPageUri}`,
      auth: {
        username: accountSid,
        password: authToken
      }
    });

    const {data} = axiosResponse;
    const {next_page_uri, messages} = data;
    const allMessages = accumulator.concat(messages);

    if(next_page_uri) {
      return await recursive(next_page_uri, allMessages);
    } else {
      return allMessages;
    }

  } catch(e) {
    throw e;
  }
}

driver();