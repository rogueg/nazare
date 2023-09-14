import type { Page } from "~parse"

const OPENAI_KEY = 'XX'

export async function nextStep (objective:string, page:Page) {
  let messages = [{
    role: 'user',
    content: `You're looking at a webpage, and your goal is to "${objective}".
      Try to either answer that question from the current page, or pick one link to click on next.

      The text of the page
      ---------------------
      ${page.body}

      The links on the page
      ---------------------
      ${page.links.map(x => x[0]).join('\n')}
    `
  }]

  let functions = [
    {
      name: 'click_link',
      description: 'click on a link with the given text',
      parameters: {type: 'object', properties: {text: {type: 'string'}}},
    }
  ]

  let model = 'gpt-4' // 'gpt-3.5-turbo-16k'
  let resp = await openAI('v1/chat/completions', {model, messages, functions})
  let choice = resp.choices[0].message

  if (choice.function_call && choice.function_call.name == 'click_link') {
    let args = JSON.parse(choice.function_call.arguments)
    let url = page.links.find(l => l[0] == args.text)[1]
    return {type: 'link', url, text: args.text}
  }

  return {type: 'done', text: choice.content}
}

async function openAI (path, opts) {
  let resp = await fetch('https://api.openai.com/' + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(opts),
  })
  return await resp.json()
}
