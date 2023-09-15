import { useState } from "react"
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"
import { parsePage, tabLoad } from "~parse"
import { nextStep } from "~think"

interface Target {
  title: string
  startUrl: string
  currentUrl: string
  loading: boolean
  nextStep: any
  tab: any
}

class Runner {
  objective: string = 'find open design jobs'
  targets: Target[]

  constructor () {
    this.targets = ['https://www.twochairs.com/', 'https://citizen.com/'].map(s => ({
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
      return <div>Loading...</div>
    }

    if (target.nextStep?.type == 'done') {
      return <div>{target.nextStep.text}</div>
    }

    if (target.nextStep?.type == 'link') {
      return <>
        <div>Click on {target.nextStep.text}</div>
        <button onClick={() => takeStep(target)}>Go</button>
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
    let page = await parsePage(target.tab)
    target.nextStep = await nextStep(runner.objective, page)
    target.loading = false
  }

  return <div>
    {runner.targets.map(t => <div key={t.startUrl}>
      <div>{t.startUrl}</div>
      {t.currentUrl != t.startUrl ? <div>{t.currentUrl}</div> : null}
      {renderStep(t)}
    </div>)}
  </div>
})
