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
    raise RuntimeError('Missing native control: ' + label)


ready = False
for attempt in range(40):
    try:
        current = nodes()
        if any(n.get('content-desc') == 'QA after' for n in current):
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
    raise RuntimeError('Native fixture did not become ready; see startup screenshot and Metro log')

for layout, size, density, font_scale in [('phone', '720x1600', '320', '1.0'), ('large-text', '720x1600', '320', '1.6'), ('tablet', '1280x2000', '240', '1.0')]:
    adb('shell', 'wm', 'size', size)
    adb('shell', 'wm', 'density', density)
    adb('shell', 'settings', 'put', 'system', 'font_scale', font_scale)
    time.sleep(3)
    for revision in ['before', 'after']:
        tap('QA ' + revision)
        for scenario in ['foundations', 'provider', 'request']:
            tap('QA ' + scenario)
            name = f'{revision}-{scenario}-{layout}'
            (out / (name + '.png')).write_bytes(adb('exec-out', 'screencap', '-p'))
            nodes()
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
metadata = json.loads(Path('.native-ui-qa/evidence.json').read_text())
metadata.update(nativeRetry='passed', nativeCheckboxToggle='passed', apiLevel=adb('shell', 'getprop', 'ro.build.version.sdk').decode().strip(), deviceModel=adb('shell', 'getprop', 'ro.product.model').decode().strip())
(out / 'evidence.json').write_text(json.dumps(metadata, indent=2))
print('Captured 19 native component screenshots and passed retry/checkbox smoke checks.')
