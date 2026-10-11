"""Capture native component fixtures; never connect to an account or backend."""
import json
import os
from pathlib import Path
import re
import subprocess
import time
import xml.etree.ElementTree as ET

out = Path(os.environ['MC_QA_OUTPUT'])
out.mkdir(parents=True, exist_ok=True)
metadata = json.loads(Path('.native-ui-qa/evidence.json').read_text())


def adb(*args):
    return subprocess.check_output(['adb', '-e', *args], timeout=30)


def nodes():
    adb('shell', 'uiautomator', 'dump', '/sdcard/qa.xml')
    return list(ET.fromstring(adb('shell', 'cat', '/sdcard/qa.xml')).iter('node'))


def tap(label):
    for node in nodes():
        if node.get('content-desc') == label or node.get('text') == label:
            x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.get('bounds')))
            adb('shell', 'input', 'tap', str((x1 + x2) // 2), str((y1 + y2) // 2))
            time.sleep(1)
            return
    (out / 'failure.png').write_bytes(adb('exec-out', 'screencap', '-p'))
    (out / 'failure.xml').write_bytes(adb('shell', 'cat', '/sdcard/qa.xml'))
    raise RuntimeError('Missing native control: ' + label)


def wait_ready(expected_width=None, expected_font=None):
    ready = False
    relaunches = 0
    for attempt in range(40):
        try:
            current = nodes()
            print('Startup', attempt, [(n.get('text'), n.get('content-desc')) for n in current if n.get('text') or n.get('content-desc')], flush=True)
            if expected_width is not None and any('launcher' in n.get('package', '') for n in current) and relaunches < 2 and adb('shell', 'pm', 'path', 'host.exp.exponent').strip():
                relaunches += 1
                adb('reverse', 'tcp:8081', 'tcp:8081')
                adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', 'exp://127.0.0.1:8081', 'host.exp.exponent')
                time.sleep(3)
                continue
            # A cold CI emulator can show a launcher ANR over the running fixture.
            # Dismiss only this known system dialog, never an app crash dialog.
            if any(n.get('text') == "Pixel Launcher isn't responding" for n in current):
                tap('Close app')
                continue
            if any('This is the developer menu' in n.get('text', '') for n in current):
                tap('Continue')
                continue
            if any(n.get('text') == 'Go Home' for n in current) and any(n.get('text') == 'Reload' for n in current):
                # Close only an observed Expo developer menu, not the app's root.
                adb('shell', 'input', 'keyevent', '4')
                time.sleep(2)
                continue
            if any(n.get('text') == 'Enter URL manually' for n in current):
                adb('reverse', 'tcp:8081', 'tcp:8081')
                adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'exp://127.0.0.1:8081', 'host.exp.exponent')
                time.sleep(3)
                continue
            if any(n.get('content-desc') == 'QA after' for n in current):
                banners = [re.search(r'([\d.]+)dp · font ([\d.]+)', n.get('text', '')) for n in current]
                configured = any(m and (expected_width is None or abs(float(m[1]) - expected_width) < 1) and (expected_font is None or abs(float(m[2]) - expected_font) < 0.05) for m in banners)
                if configured:
                    ready = True
                    break
            for label in ['Continue', 'Got it']:
                if any(n.get('text') == label for n in current):
                    tap(label)
        except (subprocess.SubprocessError, ET.ParseError):
            pass
        time.sleep(3)
    if not ready:
        (out / 'startup.png').write_bytes(adb('exec-out', 'screencap', '-p'))
        (out / 'startup.xml').write_bytes(adb('shell', 'cat', '/sdcard/qa.xml'))
        (out / 'runtime.log').write_bytes(adb('logcat', '-d', '-t', '500', 'AndroidRuntime:E', 'ReactNativeJS:E', '*:S'))
        raise RuntimeError('Native fixture did not become ready; see startup screenshot and Metro log')

adb('reverse', 'tcp:8081', 'tcp:8081')
wait_ready()

for layout, size, density, font_scale in [('phone', '720x1600', '320', '1.0'), ('large-text', '720x1600', '320', '1.6'), ('tablet', '1280x2000', '240', '1.0')]:
    adb('shell', 'wm', 'size', size)
    adb('shell', 'wm', 'density', density)
    adb('shell', 'settings', 'put', 'system', 'font_scale', font_scale)
    time.sleep(3)  # Let Android finish applying the system configuration.
    # Expo Go must restart to apply Android density/font configuration to RN.
    adb('shell', 'am', 'force-stop', 'host.exp.exponent')
    time.sleep(1)
    adb('reverse', 'tcp:8081', 'tcp:8081')
    adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', 'exp://127.0.0.1:8081', 'host.exp.exponent')
    time.sleep(3)
    wait_ready(int(size.split('x')[0]) * 160 / int(density), float(font_scale))
    for revision in ['before', 'after']:
        tap('QA ' + revision)
        for scenario in ['foundations', 'provider', 'request']:
            tap('QA ' + scenario)
            name = f'{revision}-{scenario}-{layout}'
            (out / (name + '.png')).write_bytes(adb('exec-out', 'screencap', '-p'))
            current = nodes()
            if metadata.get('phase') == 'B' and revision == 'after':
                labels = [n.get('content-desc') for n in current]
                if scenario in ['provider', 'request']:
                    assert 'Go back' in labels
                    # Current founder direction keeps compact access on every private screen.
                    assert 'Messages' in labels
                    assert 'Notifications' in labels
                if scenario == 'request':
                    assert 'Home' not in labels  # No bottom tabs on focused form.
            (out / (name + '.xml')).write_bytes(adb('shell', 'cat', '/sdcard/qa.xml'))

# Native press check on real shared retry and checkbox; no backend submission.
adb('shell', 'settings', 'put', 'system', 'font_scale', '1.0')
tap('QA after')
tap('QA foundations')
tap('Try again')
assert any(n.get('text') == 'QA retry received' for n in nodes())
tap('QA request')
tap('I understand My Corner shows trust evidence but does not guarantee provider conduct')
assert any(n.get('content-desc') == 'Review request' and n.get('enabled') == 'true' for n in nodes())
(out / 'after-request-checked.png').write_bytes(adb('exec-out', 'screencap', '-p'))
tap('I understand My Corner shows trust evidence but does not guarantee provider conduct')
assert any(n.get('content-desc') == 'Review request' and n.get('enabled') == 'false' for n in nodes())
if metadata.get('phase') == 'B':
    adb('shell', 'wm', 'size', '720x1600')
    adb('shell', 'wm', 'density', '320')
    adb('shell', 'am', 'force-stop', 'host.exp.exponent')
    time.sleep(1)
    adb('reverse', 'tcp:8081', 'tcp:8081')
    adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', 'exp://127.0.0.1:8081', 'host.exp.exponent')
    time.sleep(3)
    wait_ready(360, 1.0)
    tap('QA after')
    tap('QA request')
    adb('shell', 'settings', 'put', 'secure', 'show_ime_with_hard_keyboard', '1')
    tap('QA job title')
    adb('shell', 'input', 'text', 'Kitchen%ssink%sleak')
    time.sleep(2)
    (out / 'after-request-keyboard-phone.png').write_bytes(adb('exec-out', 'screencap', '-p'))
    adb('shell', 'input', 'keyevent', '4')
    metadata.update(compactDeepHeaders='passed', focusedFormTabs='passed')
metadata.update(nativeRetry='passed', nativeCheckboxToggle='passed', apiLevel=adb('shell', 'getprop', 'ro.build.version.sdk').decode().strip(), deviceModel=adb('shell', 'getprop', 'ro.product.model').decode().strip())
(out / 'evidence.json').write_text(json.dumps(metadata, indent=2))
print(f'Captured {len(list(out.glob("*.png")))} native component screenshots and passed retry/checkbox smoke checks.')
