export interface Page {
  title: string
  url: string
  body: string
  links: string[][]
}

export async function parsePage (tab): Promise<Page> {
  let response = await chrome.scripting.executeScript({target: {tabId: tab.id}, func: contentScript})
  console.log(response)
  return response[0].result
}

function contentScript () {
  let url = window.location.toString().replace(/#.*/, '')
  let title = document.title
  let body = document.body.innerText
  let links = Array.from(document.querySelectorAll('a')).map(el => {
    let text = el.innerText.trim().replaceAll(/[^\w\s]/g, '').replaceAll(/\s/g, ' ') // clean text, including non-printing and nbsp
    if (!text || !el.href) return
    if (el.href.replace(/#.*/, '') == url) return // ignore anchor links, they're red-herrings
    return [text, el.href]
  }).filter(x => x)
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
