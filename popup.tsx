import { useEffect, useState } from "react"
import { parsePage, type Page, tabLoad } from "~parse"
import { nextStep } from "~think"

export default function IndexPopup() {
  let [objective, setObjective] = useState("what is this company's mission?")
  let [loading, setLoading] = useState(false)
  let [result, setResult] = useState(null)

  async function computeNextStep () {
    setLoading(true)
    try {
      let page = await parsePage()
      let ns = await nextStep(objective, page)
      setResult(ns)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function takeNextStep () {
    let tabs = await chrome.tabs.query({currentWindow: true, active: true})
    let tab = tabs[0]
    setResult(null)
    await chrome.tabs.update(tab.id, {url: result.url})
    await tabLoad(tab)
    await computeNextStep()
  }

  let body = <button onClick={computeNextStep}>Start</button>

  if (loading) {
    body = <div>Thinking...</div>
  }

  else if (result?.type == 'link') {
    body = <div>
      Clicking on {result.text}
      <button onClick={takeNextStep}>Go</button>
    </div>
  }

  else if (result?.type == 'done') {
    body = <div>{result.text}</div>
  }

  return <div style={{width: 400, minHeight: 200}}>
    <input value={objective} onChange={e => setObjective(e.target.value)} />
    {body}
  </div>
}
