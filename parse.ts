export interface Page {
  title: string
  url: string
  body: string
  links: string[][]
}

export async function parsePage (): Promise<Page> {
  let tabs = await chrome.tabs.query({currentWindow: true, active: true})
  let response = await chrome.scripting.executeScript({target: {tabId: tabs[0].id}, func: contentScript})
  console.log(response)
  return response[0].result
}

function contentScript () {
  let url = window.location.toString()
  let title = document.title
  let body = document.body.innerText
  let links = Array.from(document.querySelectorAll('a'))
    .map(el => [el.innerText.trim(), el.href])
    .filter(ln => ln[0] && ln[1])
  return {title, url, body, links}
}

export async function tabLoad (tab) {
  await new Promise(resolve => {
    chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
      if (tabId == tab.id && info.status == 'complete') {
        chrome.tabs.onUpdated.removeListener(listener)
        resolve(tab)
      }
    })
  })
}
