const s = `{
    "id": "8f47de3b-c9b2-4960-8795-da34081f53d9",
    "version": "2.0",
    "name": "SingleTest-Scenario",
    "url": "https://yticks.vercel.app",
    "tests": [{
      "id": "8f56e0f1-4829-486c-94ce-40d278d51f55",
      "name": "AssertSearchBar",
      "commands": [{
        "id": "748b2ba7-2ba8-4960-88d5-0f4f661c5179",
        "comment": "",
        "command": "open",
        "target": "https://yticks.vercel.app/video",
        "targets": [],
        "value": ""
      }, {
        "id": "7f0f19f2-6eff-47b1-9952-4559f59d06b9",
        "comment": "",
        "command": "setWindowSize",
        "target": "518x480",
        "targets": [],
        "value": ""
      }, {
        "id": "c20a71f5-9a2e-4618-b9eb-fb6573e56401",
        "comment": "",
        "command": "assertEditable",
        "target": "id=:Ril56:",
        "targets": [],
        "value": ""
      }, {
        "id": "c31a226d-b8c2-47a2-b935-bd65ccba0e30",
        "comment": "",
        "command": "click",
        "target": "id=:Ril56:",
        "targets": [
          ["id=:Ril56:", "id"],
          ["name=yt-url", "name"],
          ["css=#\\3ARil56\\3A", "css:finder"],
          ["xpath=//input[@id=':Ril56:']", "xpath:attributes"],
          ["xpath=//div[@id='__next']/nav/div/div[2]/div/input", "xpath:idRelative"],
          ["xpath=//input", "xpath:position"]
        ],
        "value": ""
      }, {
        "id": "6f0a476d-dd90-4f25-8807-d1b7e69754ef",
        "comment": "",
        "command": "type",
        "target": "id=:Ril56:",
        "targets": [
          ["id=:Ril56:", "id"],
          ["name=yt-url", "name"],
          ["css=#\\3ARil56\\3A", "css:finder"],
          ["xpath=//input[@id=':Ril56:']", "xpath:attributes"],
          ["xpath=//div[@id='__next']/nav/div/div[2]/div/input", "xpath:idRelative"],
          ["xpath=//input", "xpath:position"]
        ],
        "value": "checkinghis"
      }, {
        "id": "fe44d9da-a73d-45cf-99f3-55018173b5e9",
        "comment": "Assertion for the Invalid Youtube URL",
        "command": "assertText",
        "target": "id=:Ril56:-label",
        "targets": [
          ["id=:Ril56:-label", "id"],
          ["css=#\\3ARil56\\3A-label", "css:finder"],
          ["xpath=//label[@id=':Ril56:-label']", "xpath:attributes"],
          ["xpath=//div[@id='__next']/nav/div/div[2]/label", "xpath:idRelative"],
          ["xpath=//label", "xpath:position"],
          ["xpath=//label[contains(.,'Paste a valid Youtube URL')]", "xpath:innerText"]
        ],
        "value": "Paste a valid Youtube URL"
      }]
    }],
    "suites": [{
      "id": "e3a059be-d25b-4937-953f-32dbe799aa20",
      "name": "Default Suite",
      "persistSession": false,
      "parallel": false,
      "timeout": 300,
      "tests": []
    }],
    "urls": ["https://yticks.vercel.app/"],
    "plugins": []
  }`

JSON.parse(res)