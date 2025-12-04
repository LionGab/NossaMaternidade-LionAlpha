# 📋 Plano de Migração: expo-av → expo-audio + expo-video

**Status:** Planejamento  
**Data:** Dezembro 2025  
**Referência:** Expo SDK 54 - expo-av deprecated, será removido no SDK 55

---

## 📊 Análise de Uso Atual

### ✅ Classificação: ÁUDIO (3 arquivos)

| Arquivo | Tipo | Uso Principal | Linhas Afetadas |
|---------|------|---------------|-----------------|
| `src/services/elevenLabsService.ts` | **ÁUDIO** | Reprodução de áudio TTS (Text-to-Speech) | 12, 207, 331-338, 344 |
| `src/hooks/useVoiceRecording.ts` | **ÁUDIO** | Gravação de voz + preview de áudio | 13, 81-98, 133-134, 182-193, 221-226, 238-239, 321-326, 390-397, 406 |
| `src/hooks/useAudioPlayer.ts` | **ÁUDIO** | Player de áudio de bem-estar | 7, 77, 98, 142-146, 171-175 |

### ❌ Classificação: VÍDEO

**Nenhum uso direto encontrado.**  
Referências a "video" são apenas em nomes de variáveis/componentes (ex: `ContentType.video`), não uso real de `Video` do expo-av.

---

## 🔄 Mapeamento: expo-av → expo-audio

### 1. `src/services/elevenLabsService.ts`

#### Uso Atual (expo-av):
```typescript
import { Audio, AVPlaybackStatus } from 'expo-av';

// Linha 207
private sound: Audio.Sound | null = null;

// Linha 331-335
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
});

// Linha 338
const { sound } = await Audio.Sound.createAsync(
  { uri: audioUri },
  { shouldPlay: true }
);

// Linha 344
sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
  if (status.isLoaded && status.didJustFinish) {
    this.isPlaying = false;
  }
});

// Linha 363-364
await this.sound.stopAsync();
await this.sound.unloadAsync();

// Linha 378
await this.sound.pauseAsync();

// Linha 388
await this.sound.playAsync();
```

#### Equivalente (expo-audio):
```typescript
import { AudioPlayer, useAudioPlayer } from 'expo-audio';
// OU para uso imperativo:
import { AudioPlayer, useAudioPlayer, AudioSource } from 'expo-audio';

// Substituir Audio.Sound por AudioPlayer
private player: AudioPlayer | null = null;

// setAudioModeAsync → não existe mais, configuração via AudioPlayer
// Criar player:
this.player = new AudioPlayer();
await this.player.load({ uri: audioUri });
await this.player.play();

// setOnPlaybackStatusUpdate → usar eventos ou polling
this.player.addListener('playbackStatusUpdate', (status) => {
  if (status.isLoaded && status.didJustFinish) {
    this.isPlaying = false;
  }
});

// stopAsync → stop()
await this.player.stop();

// unloadAsync → remove() ou deixar GC
this.player.remove();
this.player = null;

// pauseAsync → pause()
await this.player.pause();

// playAsync → play()
await this.player.play();
```

**Referência API:** [expo-audio AudioPlayer](https://docs.expo.dev/versions/latest/sdk/audio/)

---

### 2. `src/hooks/useVoiceRecording.ts`

#### Uso Atual (expo-av):
```typescript
import { Audio, AVPlaybackStatus } from 'expo-av';

// Linha 81-98: RecordingOptions
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
  android: { ... },
  ios: { ... },
  web: { ... },
};

// Linha 133-134: Refs
const recordingRef = useRef<Audio.Recording | null>(null);
const soundRef = useRef<Audio.Sound | null>(null);

// Linha 182-193: Permissões
const { status } = await Audio.getPermissionsAsync();
const { status } = await Audio.requestPermissionsAsync();

// Linha 221-226: setAudioModeAsync
await Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
});

// Linha 238-239: Criar Recording
const recording = new Audio.Recording();
await recording.prepareToRecordAsync(RECORDING_OPTIONS);
await recording.startAsync();

// Linha 316: Parar gravação
await recordingRef.current.stopAndUnloadAsync();
const uri = recordingRef.current.getURI();

// Linha 397: Preview (Sound)
const { sound } = await Audio.Sound.createAsync(
  { uri: recordedUri },
  { shouldPlay: true }
);

// Linha 406: Status update
sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => { ... });
```

#### Equivalente (expo-audio):
```typescript
import { AudioRecorder, AudioPlayer, useAudioRecorder } from 'expo-audio';

// RecordingOptions → AudioRecorderOptions
const RECORDING_OPTIONS: AudioRecorderOptions = {
  android: {
    extension: '.m4a',
    outputFormat: AndroidOutputFormat.MPEG_4,
    audioEncoder: AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
};

// Refs
const recorderRef = useRef<AudioRecorder | null>(null);
const playerRef = useRef<AudioPlayer | null>(null);

// Permissões → usar expo-audio permissions
import * as AudioPermissions from 'expo-audio/build/Permissions';
const { status } = await AudioPermissions.getPermissionsAsync();
const { status } = await AudioPermissions.requestPermissionsAsync();

// setAudioModeAsync → não existe mais, configuração via AudioRecorder
// Criar recorder:
const recorder = new AudioRecorder();
await recorder.prepareToRecordAsync(RECORDING_OPTIONS);
await recorder.startAsync();

// Parar gravação
await recorderRef.current.stopAsync();
const uri = recorderRef.current.getURI();

// Preview (AudioPlayer)
const player = new AudioPlayer();
await player.load({ uri: recordedUri });
await player.play();

// Status update → eventos ou polling
player.addListener('playbackStatusUpdate', (status) => { ... });
```

**Referência API:** [expo-audio AudioRecorder](https://docs.expo.dev/versions/latest/sdk/audio/#audiorecorder)

---

### 3. `src/hooks/useAudioPlayer.ts`

#### Uso Atual (expo-av):
```typescript
import { Audio, AVPlaybackStatus } from 'expo-av';

// Linha 77
const soundRef = useRef<Audio.Sound | null>(null);

// Linha 98
const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
  if (!status.isLoaded) { ... }
  setIsPlaying(status.isPlaying);
  setDuration(status.durationMillis || 0);
  setPosition(status.positionMillis || 0);
  if (status.didJustFinish) { ... }
}, []);

// Linha 142-146
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
});

// Linha 171-175
const { sound } = await Audio.Sound.createAsync(
  { uri: audioUri },
  { shouldPlay: true },
  onPlaybackStatusUpdate
);

// Linha 198, 207, 216, 241, 253, 262
await soundRef.current.pauseAsync();
await soundRef.current.playAsync();
await soundRef.current.stopAsync();
await soundRef.current.setPositionAsync(targetPosition);
```

#### Equivalente (expo-audio):
```typescript
import { AudioPlayer, useAudioPlayer } from 'expo-audio';

// Ref
const playerRef = useRef<AudioPlayer | null>(null);

// Status update → eventos
const onPlaybackStatusUpdate = useCallback((status) => {
  if (!status.isLoaded) { ... }
  setIsPlaying(status.isPlaying);
  setDuration(status.duration || 0);
  setPosition(status.position || 0);
  if (status.didJustFinish) { ... }
}, []);

// setAudioModeAsync → não existe mais
// Criar player:
const player = new AudioPlayer();
player.addListener('playbackStatusUpdate', onPlaybackStatusUpdate);
await player.load({ uri: audioUri });
await player.play();

// Controles
await playerRef.current.pause();
await playerRef.current.play();
await playerRef.current.stop();
await playerRef.current.seekTo(targetPosition);
```

**Referência API:** [expo-audio AudioPlayer](https://docs.expo.dev/versions/latest/sdk/audio/#audioplayer)

---

## 📝 Plano Incremental de Refatoração

### **ETAPA 1: Introduzir novas libs em paralelo** ⚠️ NÃO QUEBRA

**Objetivo:** Adicionar `expo-audio` sem remover `expo-av` ainda.

#### Tasks:

1. **Instalar dependências:**
   ```bash
   npx expo install expo-audio
   ```

2. **Criar wrappers/compatibilidade (opcional):**
   - Criar `src/utils/audioCompat.ts` com funções helper que abstraem diferenças
   - OU migrar diretamente (recomendado)

3. **Atualizar package.json:**
   - Adicionar `expo-audio` às dependencies
   - Manter `expo-av` por enquanto

4. **Verificar compatibilidade:**
   - Testar que app ainda funciona com expo-av
   - Validar que expo-audio está instalado corretamente

**Arquivos a modificar:**
- `package.json` (adicionar expo-audio)

**Tempo estimado:** 15 minutos

---

### **ETAPA 2: Trocar uso nas telas/hooks/services** 🔄 MIGRAÇÃO

**Objetivo:** Substituir todas as chamadas de `expo-av` por `expo-audio`.

#### Tasks por arquivo:

#### 2.1. `src/services/elevenLabsService.ts`

**Mudanças:**
- Linha 12: `import { Audio, AVPlaybackStatus } from 'expo-av'` → `import { AudioPlayer } from 'expo-audio'`
- Linha 207: `private sound: Audio.Sound | null = null` → `private player: AudioPlayer | null = null`
- Linha 331-335: Remover `Audio.setAudioModeAsync()` (não existe mais)
- Linha 338: `Audio.Sound.createAsync()` → `new AudioPlayer()` + `load()` + `play()`
- Linha 344: `setOnPlaybackStatusUpdate()` → `addListener('playbackStatusUpdate')`
- Linha 363-364: `stopAsync()` + `unloadAsync()` → `stop()` + `remove()`
- Linha 378: `pauseAsync()` → `pause()`
- Linha 388: `playAsync()` → `play()`

**Trechos específicos:**

```typescript
// ANTES (linha 325-355)
async play(audioUri: string): Promise<void> {
  await this.stop();
  await Audio.setAudioModeAsync({ ... });
  const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });
  this.sound = sound;
  sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => { ... });
}

// DEPOIS
async play(audioUri: string): Promise<void> {
  await this.stop();
  this.player = new AudioPlayer();
  await this.player.load({ uri: audioUri });
  this.player.addListener('playbackStatusUpdate', (status) => {
    if (status.isLoaded && status.didJustFinish) {
      this.isPlaying = false;
    }
  });
  await this.player.play();
  this.isPlaying = true;
}
```

---

#### 2.2. `src/hooks/useVoiceRecording.ts`

**Mudanças:**
- Linha 13: `import { Audio, AVPlaybackStatus } from 'expo-av'` → `import { AudioRecorder, AudioPlayer } from 'expo-audio'`
- Linha 81-98: `Audio.RecordingOptions` → `AudioRecorderOptions` (ajustar estrutura)
- Linha 133-134: `Audio.Recording` → `AudioRecorder`, `Audio.Sound` → `AudioPlayer`
- Linha 182-193: `Audio.getPermissionsAsync()` → `expo-audio` permissions (verificar API)
- Linha 221-226: Remover `Audio.setAudioModeAsync()` (não existe mais)
- Linha 238-239: `new Audio.Recording()` → `new AudioRecorder()`
- Linha 316: `stopAndUnloadAsync()` → `stopAsync()` (separar unload)
- Linha 397: `Audio.Sound.createAsync()` → `new AudioPlayer()` + `load()` + `play()`
- Linha 406: `setOnPlaybackStatusUpdate()` → `addListener('playbackStatusUpdate')`

**Trechos específicos:**

```typescript
// ANTES (linha 205-240)
const startRecording = useCallback(async (): Promise<boolean> => {
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, ... });
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(RECORDING_OPTIONS);
  await recording.startAsync();
  recordingRef.current = recording;
}, []);

// DEPOIS
const startRecording = useCallback(async (): Promise<boolean> => {
  const recorder = new AudioRecorder();
  await recorder.prepareToRecordAsync(RECORDING_OPTIONS);
  await recorder.startAsync();
  recorderRef.current = recorder;
}, []);
```

---

#### 2.3. `src/hooks/useAudioPlayer.ts`

**Mudanças:**
- Linha 7: `import { Audio, AVPlaybackStatus } from 'expo-av'` → `import { AudioPlayer } from 'expo-audio'`
- Linha 77: `Audio.Sound` → `AudioPlayer`
- Linha 98: `AVPlaybackStatus` → tipo do expo-audio (verificar API)
- Linha 142-146: Remover `Audio.setAudioModeAsync()` (não existe mais)
- Linha 171-175: `Audio.Sound.createAsync()` → `new AudioPlayer()` + `load()` + `play()`
- Linha 198, 207, 216, 241, 253, 262: `pauseAsync()` → `pause()`, `playAsync()` → `play()`, `stopAsync()` → `stop()`, `setPositionAsync()` → `seekTo()`

**Trechos específicos:**

```typescript
// ANTES (linha 125-175)
const play = useCallback(async (audio: AudioWellnessItem) => {
  await Audio.setAudioModeAsync({ ... });
  const { sound } = await Audio.Sound.createAsync(
    { uri: audioUri },
    { shouldPlay: true },
    onPlaybackStatusUpdate
  );
  soundRef.current = sound;
}, [onPlaybackStatusUpdate]);

// DEPOIS
const play = useCallback(async (audio: AudioWellnessItem) => {
  const player = new AudioPlayer();
  player.addListener('playbackStatusUpdate', onPlaybackStatusUpdate);
  await player.load({ uri: audioUri });
  await player.play();
  playerRef.current = player;
}, [onPlaybackStatusUpdate]);
```

---

**Arquivos a modificar:**
- `src/services/elevenLabsService.ts`
- `src/hooks/useVoiceRecording.ts`
- `src/hooks/useAudioPlayer.ts`

**Tempo estimado:** 2-3 horas (incluindo testes)

---

### **ETAPA 3: Remover expo-av do package.json** 🧹 LIMPEZA

**Objetivo:** Remover dependência antiga após validação completa.

#### Tasks:

1. **Validar que não há mais imports de expo-av:**
   ```bash
   grep -r "from 'expo-av'" src/
   grep -r 'from "expo-av"' src/
   ```

2. **Remover do package.json:**
   ```bash
   npm uninstall expo-av
   ```

3. **Limpar cache:**
   ```bash
   npm start -- --reset-cache
   ```

4. **Testes finais:**
   - Testar gravação de voz
   - Testar reprodução de áudio TTS
   - Testar player de bem-estar
   - Verificar que não há warnings de expo-av

**Arquivos a modificar:**
- `package.json` (remover expo-av)

**Tempo estimado:** 15 minutos

---

## 🧪 Checklist de Validação

### Após Etapa 1:
- [ ] `expo-audio` instalado
- [ ] App ainda funciona com `expo-av`
- [ ] Sem erros de import

### Após Etapa 2:
- [ ] Todos os arquivos migrados
- [ ] Gravação de voz funciona
- [ ] Reprodução de áudio TTS funciona
- [ ] Player de bem-estar funciona
- [ ] Preview de gravação funciona
- [ ] Controles (play/pause/stop/seek) funcionam
- [ ] Sem erros no console
- [ ] Sem warnings de expo-av deprecated

### Após Etapa 3:
- [ ] `expo-av` removido do package.json
- [ ] Nenhum import de expo-av no código
- [ ] App funciona normalmente
- [ ] Build funciona (Android/iOS)

---

## 📚 Referências

- [Expo Audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Expo Video Documentation](https://docs.expo.dev/versions/latest/sdk/video/)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
- [Migration Guide (não oficial, mas útil)](https://github.com/expo/expo/issues/...)

---

## ⚠️ Notas Importantes

1. **API Differences:**
   - `setAudioModeAsync()` não existe mais em expo-audio
   - `AVPlaybackStatus` → tipo diferente (verificar API)
   - `RecordingOptions` → estrutura pode ser diferente
   - Permissões podem ter API diferente

2. **Breaking Changes:**
   - `Sound.createAsync()` → `new AudioPlayer()` + `load()` + `play()`
   - `setOnPlaybackStatusUpdate()` → `addListener('playbackStatusUpdate')`
   - Métodos assíncronos podem ter nomes diferentes

3. **Testes Críticos:**
   - Gravação de voz (useVoiceRecording)
   - Reprodução TTS (elevenLabsService)
   - Player de bem-estar (useAudioPlayer)
   - Preview de gravação
   - Controles de playback

---

**Status do Plano:** ✅ Pronto para implementação  
**Próximo Passo:** Executar Etapa 1 (instalar expo-audio)

