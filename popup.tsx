import { useEffect, useState } from "react"
import { parsePage, type Page, tabLoad } from "~parse"
import { nextStep } from "~think"
import './basic.css'

export default function IndexPopup() {
  let [objective, setObjective] = useState('')
  let [loading, setLoading] = useState(false)
  let [result, setResult] = useState(null)

  useEffect(() => {
    if (localStorage.getItem('lastUrl') == window.location.toString()) {
      setObjective(localStorage.getItem('lastObjective'))
    }
  }, [])

  async function computeNextStep () {
    setLoading(true)
    try {
      let tabs = await chrome.tabs.query({currentWindow: true, active: true})
      let page = await parsePage(tabs[0])
      let ns = await nextStep(objective, page)
      localStorage.setItem('lastUrl', window.location.toString())
      localStorage.setItem('lastObjective', objective)
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

  let body = <div className="center">
    <button onClick={computeNextStep} className="mr12">Start</button>
    <a href={window.location.origin + '/tabs/parallel.html'} target="_blank">Parallel Mode</a>
  </div>

  if (loading) {
    body = <div className="center">Thinking...</div>
  }

  else if (result?.type == 'link') {
    body = <div className="center">
      <div className="mb12">Next step: click "{result.text}"</div>
      <button onClick={takeNextStep}>Go</button>
    </div>
  }

  else if (result?.type == 'done') {
    body = <div>{result.text}</div>
  }

  return <div className="popup">
    <input value={objective} onChange={e => setObjective(e.target.value)} className="full mb12" />
    {body}
  </div>
}
