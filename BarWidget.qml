import QtQuick
import QtQuick.Controls
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "model.mjs" as Model

Panel {
  id: omaglobe
  moduleName: "io.github.mark-omarov.omaglobe"
  ipcTarget: "omaglobe"
  manageIpc: false

  readonly property string home: Quickshell.env("HOME")
  readonly property string stateDir: home + "/.local/state/omaglobe"
  readonly property string server: Model.serverUrl(setting("server", ""))
  readonly property color foreground: bar ? bar.foreground : Color.foreground
  readonly property color dim: Qt.darker(foreground, 1.55)
  readonly property string fontFamily: bar ? bar.fontFamily : Style.font.family
  // Hidden while off, like the indicators, until the bar's center is hovered.
  readonly property bool revealed: online || opened
    || (bar && bar.centerSectionRevealHeld === true && bar.centerHoverRevealSuppressed !== true)

  property string installId: ""
  property string city: ""
  property bool online: false
  property bool loaded: false
  property var heat: null
  property string error: ""
  property int failures: 0
  property bool helpOpen: false
  property string syncId: ""

  // The dropdown assigns its own value on a pick, which breaks a binding.
  onCityChanged: if (picker) picker.value = city

  visible: revealed
  implicitWidth: revealed ? button.implicitWidth : 0
  implicitHeight: button.implicitHeight

  function save() {
    stateFile.setText(JSON.stringify({ id: installId, city: city, online: online, sync: syncId }, null, 2) + "\n")
  }

  function post(path, body, done, failed) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== XMLHttpRequest.DONE) return
      var data = null
      try { data = JSON.parse(xhr.responseText) } catch (e) {}
      if (xhr.status >= 200 && xhr.status < 300) {
        if (done) done(data)
      } else if (failed) {
        failed(xhr.status, data && data.error)
      }
    }
    xhr.open("POST", omaglobe.server + path)
    xhr.setRequestHeader("content-type", "application/json")
    xhr.send(JSON.stringify(body))
  }

  function heartbeat() {
    if (!online || installId === "" || city === "") return
    post("/api/online", { id: installId, city: city }, function (data) {
      omaglobe.failures = 0
      omaglobe.error = ""
      omaglobe.heat = data ? data.heat : null
      omaglobe.syncPage()
      beat.restart()
    }, function (status, message) {
      if (status === 429) {
        retry.interval = 60000
        retry.restart()
        return
      }
      omaglobe.failures += 1
      omaglobe.error = status >= 400 && status < 500 ? (message || "HTTP " + status) : ""
      retry.interval = Model.retryDelay(omaglobe.failures)
      retry.restart()
    })
  }

  function syncPage() {
    if (syncId !== "") post("/api/sync", { sync: syncId, me: online ? city : "" }, null, null)
  }

  function refreshHeat() {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== XMLHttpRequest.DONE || xhr.status !== 200) return
      try { omaglobe.heat = JSON.parse(xhr.responseText) } catch (e) {}
    }
    xhr.open("GET", omaglobe.server + "/api/heat")
    xhr.send()
  }

  onOpenedChanged: if (opened) refreshHeat()

  function setOnline(on) {
    if (on && city === "") {
      locate(true)
      return
    }
    online = on
    failures = 0
    retry.stop()
    save()
    syncPage()
    if (on) heartbeat()
    else {
      beat.stop()
      post("/api/offline", { id: installId }, null, null)
    }
  }

  function pick(id) {
    if (!id || id === city) return
    city = id
    save()
    syncPage()
    if (online) heartbeat()
  }

  function locate(thenShare) {
    var found = Model.cityFromWeather(weatherFile.text())
    if (found === "") found = Model.cityFromZone(zoneTab.text(), Model.zoneFromPath(localtime.target))
    if (found === "") {
      error = "couldn't tell where you are, pick a city"
      return
    }
    error = ""
    pick(found)
    if (thenShare) setOnline(true)
  }

  function openMap() {
    if (syncId === "") {
      syncId = Model.newId()
      save()
    }
    var link = Model.pageLink(server, { theme: Model.themeHex(themeFile.text()), city: online ? city : "", sync: syncId })
    Util.execArgv(["xdg-open", link])
  }

  IpcHandler {
    target: "omaglobe"
    function open(): void { omaglobe.open() }
    function close(): void { omaglobe.close() }
    function toggle(): void { omaglobe.toggle() }
    function toggleSharing(): string {
      omaglobe.setOnline(!omaglobe.online)
      return omaglobe.online ? "sharing " + omaglobe.city : "off"
    }
    function status(): string { return omaglobe.online ? "sharing " + omaglobe.city : "off" }
  }

  // Kept out of shell.json so a published dotfiles repo doesn't carry it.
  FileView {
    id: stateFile
    path: omaglobe.stateDir + "/state.json"
    printErrors: false
    onLoaded: {
      var s = Model.parseState(text())
      omaglobe.city = s.city
      omaglobe.online = s.online
      omaglobe.installId = s.id !== "" ? s.id : Model.newId()
      omaglobe.syncId = s.sync
      omaglobe.loaded = true
      omaglobe.heartbeat()
    }
    onLoadFailed: {
      omaglobe.installId = Model.newId()
      omaglobe.loaded = true
      mkdir.running = true
    }
  }

  Process {
    id: mkdir
    command: ["mkdir", "-p", omaglobe.stateDir]
    onExited: omaglobe.save()
  }

  FileView {
    id: weatherFile
    path: omaglobe.home + "/.local/state/omarchy/settings/weather.json"
    printErrors: false
    blockLoading: true
  }

  FileView {
    id: zoneTab
    path: "/usr/share/zoneinfo/zone.tab"
    printErrors: false
    blockLoading: true
  }

  Process {
    id: localtime
    property string target: ""
    running: true
    command: ["readlink", "-f", "/etc/localtime"]
    stdout: StdioCollector {
      waitForEnd: true
      onStreamFinished: localtime.target = String(text || "").trim()
    }
  }

  FileView {
    id: themeFile
    path: omaglobe.home + "/.local/state/omarchy/current/theme/colors.toml"
    printErrors: false
    blockLoading: true
    onLoaded: if (omaglobe.syncId !== "") omaglobe.post("/api/sync", { sync: omaglobe.syncId, theme: Model.themeHex(text()) }, null, null)
  }

  Connections {
    target: Color
    function onAccentChanged() { themeFile.reload() }
    function onBackgroundChanged() { themeFile.reload() }
  }

  Timer {
    id: beat
    interval: Model.HEARTBEAT_MS
    running: omaglobe.online && omaglobe.loaded && omaglobe.failures === 0
    repeat: true
    onTriggered: omaglobe.heartbeat()
  }

  Timer {
    id: retry
    repeat: false
    onTriggered: omaglobe.heartbeat()
  }

  BarIconButton {
    id: button
    anchors.fill: parent
    bar: omaglobe.bar
    text: "󰇧"
    dimmed: !omaglobe.online
    tooltipText: omaglobe.online ? "omaglobe · sharing " + Model.cityLabel(omaglobe.city) : "omaglobe · off"
    onPressed: function (b) {
      if (b === Qt.RightButton) omaglobe.openMap()
      else omaglobe.toggle()
    }
  }

  KeyboardPanel {
    id: panel
    anchorItem: button
    owner: omaglobe
    bar: omaglobe.bar
    open: omaglobe.opened
    focusTarget: keyCatcher
    contentWidth: panel.fittedContentWidth(Style.space(340))
    contentHeight: panel.fittedContentHeight(column.implicitHeight, Style.space(420))

    PanelKeyCatcher {
      id: keyCatcher
      anchors.fill: parent
      onCloseRequested: omaglobe.close()
      onTabRequested: function (direction) { omaglobe.switchPanel(direction) }
      onActivateRequested: omaglobe.setOnline(!omaglobe.online)
      onTextKey: function (t) {
        var key = String(t).toLowerCase()
        if (key === "s" || key === " ") omaglobe.setOnline(!omaglobe.online)
        else if (key === "l") omaglobe.locate(false)
        else if (key === "o") omaglobe.openMap()
        else if (key === "?") omaglobe.helpOpen = !omaglobe.helpOpen
      }

      Column {
        id: column
        width: parent.width
        spacing: Style.space(12)

        PanelHero {
          id: hero
          width: parent.width
          title: "omaglobe"
          meta: !omaglobe.online ? "off"
            : omaglobe.failures > 0 ? "reconnecting"
            : "sharing " + Model.cityLabel(omaglobe.city).toLowerCase()
          foreground: omaglobe.foreground
          fontFamily: omaglobe.fontFamily
          iconOpacity: omaglobe.online ? 1.0 : 0.5
          iconComponent: Component {
            Text {
              text: "󰇧"
              color: hero.foreground
              font.family: hero.fontFamily
              font.pixelSize: Style.font.displayLarge
            }
          }
          trailingControl: Component {
            Row {
              spacing: Style.space(8)

              PanelActionButton {
                iconText: "?"
                tooltipText: "what gets shared"
                foreground: hero.foreground
                fontFamily: hero.fontFamily
                anchors.verticalCenter: parent.verticalCenter
                onClicked: omaglobe.helpOpen = !omaglobe.helpOpen
              }

              ToggleSwitch {
                checked: omaglobe.online
                foreground: hero.foreground
                anchors.verticalCenter: parent.verticalCenter
                onToggled: omaglobe.setOnline(!omaglobe.online)
              }
            }
          }
        }

        Text {
          visible: omaglobe.helpOpen
          width: parent.width
          text: "While on, this machine's city and a random install id are sent once an hour. Nothing else, never your location. It drops off the map about an hour after it stops, or right away when you switch it off. A city shows on the map once 3 machines are there."
          color: omaglobe.dim
          font.family: omaglobe.fontFamily
          font.pixelSize: Style.font.caption
          wrapMode: Text.WordWrap
        }

        Flow {
          visible: omaglobe.helpOpen
          width: parent.width
          spacing: Style.space(12)

          Repeater {
            model: [["enter", "share"], ["l", "locate"], ["o", "open the map"], ["?", "help"], ["esc", "close"]]

            Text {
              required property var modelData
              text: modelData[0] + " " + modelData[1]
              color: omaglobe.dim
              font.family: omaglobe.fontFamily
              font.pixelSize: Style.font.caption
            }
          }
        }

        Text {
          visible: text !== ""
          width: parent.width
          text: Model.summary(omaglobe.heat)
          color: omaglobe.foreground
          font.family: omaglobe.fontFamily
          font.pixelSize: Style.font.bodySmall
          wrapMode: Text.WordWrap
        }

        Text {
          visible: omaglobe.error !== ""
          width: parent.width
          text: omaglobe.error
          color: omaglobe.bar ? omaglobe.bar.urgent : Color.urgent
          font.family: omaglobe.fontFamily
          font.pixelSize: Style.font.bodySmall
          wrapMode: Text.WordWrap
        }

        Row {
          width: parent.width
          spacing: Style.space(8)

          SearchableDropdown {
            id: picker
            width: parent.width - locateButton.width - parent.spacing
            Component.onCompleted: value = omaglobe.city
            label: "city"
            fontFamily: omaglobe.fontFamily
            placeholderText: "search cities..."
            options: Model.cityOptions()
            triggerLabel: omaglobe.city !== "" ? Model.cityLabel(omaglobe.city) : "pick your city"
            onChanged: function (value) { omaglobe.pick(value) }
          }

          PanelActionButton {
            id: locateButton
            anchors.bottom: parent.bottom
            size: Style.spacing.controlHeight
            iconText: "󰆤"
            tooltipText: "use my location"
            foreground: omaglobe.foreground
            fontFamily: omaglobe.fontFamily
            bordered: true
            onClicked: omaglobe.locate(false)
          }
        }

        Button {
          width: parent.width
          text: "open the map"
          fontFamily: omaglobe.fontFamily
          bordered: true
          onClicked: omaglobe.openMap()
        }
      }
    }
  }
}
