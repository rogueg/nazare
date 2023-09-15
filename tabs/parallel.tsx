import { useState } from "react"
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"
import { parsePage, tabLoad } from "~parse"
import { nextStep } from "~think"
import "../basic.css"

interface Target {
  title: string
  startUrl: string
  currentUrl: string
  loading: boolean
  nextStep: any
  tab: any
  screenshot: string
}

class Runner {
  objective: string = 'find open design jobs'
  targets: Target[]

  constructor () {
    this.targets = ['https://khealth.com/', 'https://includedhealth.com/'].map(s => ({
      startUrl: s,
      currentUrl: s,
      loading: false,
      nextStep: null
    } as Target))
    makeAutoObservable(this)
  }
}

let runner = new Runner()

export default observer(function Parallel () {
  function renderStep (target) {
    if (target.loading) {
      return <div className="mb12">Loading...</div>
    }

    if (target.nextStep?.type == 'done') {
      return <div className="mb12">{target.nextStep.text}</div>
    }

    if (target.nextStep?.type == 'link') {
      return <>
        <div className="mb12">Next step: Click on "{target.nextStep.text}"</div>
        <button className="mr12" onClick={() => takeStep(target)}>Go</button>
      </>
    }

    return <>
      <button onClick={() => takeStep(target)}>Start</button>
    </>
  }

  async function takeStep (target) {
    let url = target.nextStep ? target.nextStep.url : target.startUrl

    target.loading = true
    if (!target.tab) {
      target.tab = await chrome.tabs.create({url, active: false})
    } else {
      await chrome.tabs.update(target.tab.id, {url})
    }
    await tabLoad(target.tab)
    // target.screenshot = await chrome.tabs.captureVisibleTab(target.tab.windowId, {format: 'png'})
    let page = await parsePage(target.tab)
    target.title = page.title
    target.nextStep = await nextStep(runner.objective, page)
    target.loading = false
  }

  function showTab (target) {
    chrome.tabs.update(target.tab.id, {active: true})
  }

  return <div className="parallel">
    {runner.targets.map(t => <div key={t.startUrl} className="row">
      <div className="h3 mb12">{t.title || t.startUrl}</div>
      {t.currentUrl != t.startUrl ? <div>{t.currentUrl}</div> : null}
      {/* <img src={t.screenshot} /> */}
      {renderStep(t)}
      {t.tab ? <button onClick={() => showTab(t)}>Show tab</button> : null}
    </div>)}
  </div>
})
