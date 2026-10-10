/* global __dirname */
// CI-only native component fixture. Never imported by expo-router/entry.
// Copies real presentation source at two Git refs. Data/navigation adapters are
// explicit test doubles; screenshots do not prove signed-in product flows.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'mobile/.native-ui-qa');
const baseline = process.env.MC_QA_BASELINE || '5071729d51dd00e6fe438c3d34b8a3be2f2f40fc';
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const files = [
  'src/theme/tokens.ts',
  'src/theme/typography.ts',
  'src/lib/network-status.ts',
  'src/lib/navigation-layout.ts',
  ...[
    'Screen',
    'AppHeader',
    'BottomNavigation',
    'MessagesAccess',
    'AskMyCornerAccess',
    'ActionPill',
    'StateBlocks',
    'Surface',
    'TrustAcknowledgement',
    'NavigationArtwork',
    'IconButton',
    'JobReportParts',
    'brand/MyCornerLogo',
  ].map((name) => `src/components/${name}.tsx`),
];
function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
for (const [revision, ref] of [
  ['before', baseline],
  ['after', head],
]) {
  const target = path.join(out, revision);
  for (const file of files) {
    let source;
    try {
      source = execFileSync('git', ['show', `${ref}:mobile/${file}`], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      continue;
    } // Additive components do not exist at older baselines.
    source = source.replace(/from '([^']+)'/g, (original, name) => {
      let destination;
      if (name === 'expo-router') destination = path.join(out, 'router');
      else if (name === '@react-native-community/netinfo') destination = path.join(out, 'data');
      else if (
        name.startsWith('@/hooks/') ||
        name === '@/components/CollapsibleComments' ||
        ['@/lib/capabilities', '@/lib/messaging', '@/lib/neighborhood-assistant', '@/lib/events-feature'].includes(name)
      )
        destination = path.join(out, 'data');
      else if (name.startsWith('@/')) destination = path.join(target, 'src', name.slice(2));
      else return original;
      let relative = path
        .relative(path.dirname(path.join(target, file)), destination)
        .split(path.sep)
        .join('/');
      if (!relative.startsWith('.')) relative = `./${relative}`;
      return `from '${relative}'`;
    });
    write(path.join(target, file), source);
  }
  const font = execFileSync('git', ['show', `${ref}:mobile/assets/navigation/MyCornerNavigation.ttf`], { cwd: root });
  write(path.join(target, 'assets/navigation/MyCornerNavigation.ttf'), font);
}
write(
  path.join(out, 'data.tsx'),
  `
export const useNetInfo = () => ({isConnected: false, isInternetReachable: false});
export const useProtectedResource = () => ({data: {community: true, provider: false, name: 'QA neighborhood'}, loading: false});
export const useMessagingResource = () => ({data: {unread: 4}, loading: false});
export const getCurrentCapabilities = async () => ({});
export const loadUnread = async () => ({unread: 4});
export const loadAskContext = async () => ({});
export const isEventsClientEnabled = () => true;
export const CommentsProvider = ({children}) => children;
`,
);
write(
  path.join(out, 'router.tsx'),
  `
import {useEffect, useSyncExternalStore} from 'react';
let stack = ['/home']; const listeners = new Set();
const notify = () => listeners.forEach(fn => fn());
export const setQaPath = path => {stack = path === '/home' ? ['/home'] : ['/home', path]; notify();};
export const usePathname = () => useSyncExternalStore(fn => {listeners.add(fn); return () => listeners.delete(fn);}, () => stack.at(-1));
export const useFocusEffect = fn => useEffect(fn, [fn]);
const go = path => {stack.push(typeof path === 'string' ? path : path.pathname); notify();};
export const router = {push: go, navigate: go, canGoBack: () => stack.length > 1, back: () => {stack.pop(); notify();}, replace: path => {stack[stack.length-1] = path; notify();}};
`,
);
write(
  path.join(out, 'App.tsx'),
  `
import React, {useState} from 'react';
import {registerRootComponent} from 'expo';
import {View, Text, Pressable, TextInput} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {usePathname, setQaPath} from './router';
import * as Before from './before/src/components/StateBlocks';
import * as After from './after/src/components/StateBlocks';
import {Screen as BeforeScreen} from './before/src/components/Screen';
import {Screen as AfterScreen} from './after/src/components/Screen';
import {ActionPill as BeforeAction} from './before/src/components/ActionPill';
import {ActionPill as AfterAction} from './after/src/components/ActionPill';
import {TrustAcknowledgement as BeforeTrust} from './before/src/components/TrustAcknowledgement';
import {TrustAcknowledgement as AfterTrust} from './after/src/components/TrustAcknowledgement';
const text = {fontSize:16, color:'#102A43', lineHeight:24};
function App() {
 const [revision,setRevision] = useState('before'); const [scenario,setScenario] = useState('foundations');
 const [checked,setChecked] = useState(false); const [retried,setRetried] = useState(false);
 const pathname = usePathname();
 const Screen = revision === 'before' ? BeforeScreen : AfterScreen;
 const Action = revision === 'before' ? BeforeAction : AfterAction;
 const Trust = revision === 'before' ? BeforeTrust : AfterTrust;
 const Blocks = revision === 'before' ? Before : After;
 const select = name => {setScenario(name); setQaPath(name === 'provider' ? '/hire/provider/qa' : name === 'request' ? '/hire/request/new' : '/home');};
 const title = scenario === 'provider' ? 'QA Provider with a longer public name' : scenario === 'request' ? 'Create request' : 'My Corner home';
 return <SafeAreaProvider><SafeAreaView style={{flex:1,backgroundColor:'#FBF7EE'}} edges={['top']}>
  <View style={{paddingHorizontal:8,paddingBottom:4,backgroundColor:'#E7EBE8'}}>
   <Text allowFontScaling={false} style={{fontSize:11,color:'#102A43'}}>Native QA fixture · {revision} · {scenario} · no live data</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap'}}>{['before','after','foundations','provider','request'].map(name => <Pressable key={name} accessibilityRole="button" accessibilityLabel={'QA '+name} onPress={() => ['before','after'].includes(name) ? setRevision(name) : select(name)} style={{padding:8,minHeight:36}}><Text allowFontScaling={false} style={{fontSize:12,color:'#102A43'}}>{name}</Text></Pressable>)}</View>
  </View>
  <Screen title={title}>
   {scenario === 'foundations' ? <>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><Action label="Search" onPress={()=>{}}/><Action label="Continue" primary onPress={()=>{}}/><Action label="Unavailable" disabled onPress={()=>{}}/></View>
    <Blocks.ErrorState title="Search unavailable" body="Check your connection and try again." onRetry={()=>setRetried(true)}/>
    {retried ? <Text style={text}>QA retry received</Text> : null}
    <Blocks.EmptyState title="No active requests" body="Choose Hire help to get started."/>
    <Trust checked={checked} onChange={setChecked}/>
   </> : scenario === 'provider' ? <>
    <Text style={text}>QA plumbing · QA neighborhood</Text>
    <Text style={text}>Test fixture. Trust evidence is not a guarantee.</Text>
    <Action label="Start request" primary onPress={()=>select('request')}/>
    <Text accessibilityRole="header" style={{...text,fontWeight:'700'}}>Provider Reputation</Text>
    <Text style={text}>No live ratings or reviews in this component fixture.</Text>
   </> : <>
    <Text style={text}>Job title</Text><TextInput accessibilityLabel="QA job title" placeholder="Describe the work" style={{borderWidth:1,borderColor:'#7A867E',padding:12,minHeight:48,fontSize:16}}/>
    <Text style={text}>Description</Text><TextInput accessibilityLabel="QA description" multiline style={{borderWidth:1,borderColor:'#7A867E',padding:12,minHeight:88,fontSize:16}}/>
    <Trust checked={checked} onChange={setChecked}/>
    <Action label="Review request" primary disabled={!checked} onPress={()=>{}}/>
   </>}
   <Text style={{fontSize:12,color:'#52606D'}}>QA path: {pathname}</Text>
  </Screen>
 </SafeAreaView></SafeAreaProvider>;
}
registerRootComponent(App);
`,
);
const packagePath = path.join(root, 'mobile/package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.main = '.native-ui-qa/App.tsx';
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
write(
  path.join(out, 'evidence.json'),
  JSON.stringify(
    {
      phase: process.env.MC_QA_PHASE || 'A',
      baseline,
      head,
      renderer: 'Android emulator / Expo Go / real native shared components',
      testDoubles: ['router adapter', 'capabilities', 'unread count', 'network state', 'comments provider'],
      liveData: false,
      fullProductFlowAcceptance: false,
    },
    null,
    2,
  ),
);
console.log('Prepared native component fixtures for', baseline, 'and', head);
