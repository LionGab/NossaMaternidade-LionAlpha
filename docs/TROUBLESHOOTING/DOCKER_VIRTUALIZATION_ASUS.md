# 🔧 Docker Desktop - Habilitar Virtualização (ASUS)

## ⚠️ Problema Detectado

Seu sistema ASUS tem a virtualização **desabilitada** no BIOS/UEFI.

**Status:**
- ✅ Sistema: ASUS
- ❌ Virtualização: `VirtualizationFirmwareEnabled = FALSE`

## 🚀 Solução Rápida (ASUS)

### Passo 1: Acessar BIOS/UEFI

1. **Reinicie o computador**
2. **Durante a inicialização, pressione repetidamente:**
   - `F2` (mais comum em ASUS)
   - Ou `Delete` (alternativa)
   - Ou `F1` (alguns modelos)

3. **Se não funcionar, use o Windows:**
   - Settings → Update & Security → Recovery
   - Advanced startup → Restart now
   - Troubleshoot → Advanced options → UEFI Firmware Settings

### Passo 2: Habilitar Virtualização

No BIOS/UEFI da ASUS:

1. **Navegue até:**
   - `Advanced` → `CPU Configuration`
   - Ou `Advanced` → `System Agent Configuration` → `VT-d`
   - Ou `Advanced` → `Intel Virtualization Technology`

2. **Procure por uma destas opções:**
   - `Intel Virtualization Technology` (Intel)
   - `AMD-V` (AMD)
   - `SVM Mode` (AMD)
   - `Virtualization Technology (VT-x)`

3. **Altere de `Disabled` para `Enabled`**

4. **Salve e saia:**
   - Pressione `F10` (Save & Exit)
   - Ou `Esc` → `Save Changes and Exit`

5. **Reinicie o Windows**

### Passo 3: Verificar

Após reiniciar, execute no PowerShell (como Administrador):

```powershell
wmic cpu get VirtualizationFirmwareEnabled
```

**Deve retornar:** `TRUE`

### Passo 4: Iniciar Docker Desktop

Agora o Docker Desktop deve iniciar sem erros.

## 📋 Checklist

- [ ] Acessei o BIOS/UEFI (F2 durante boot)
- [ ] Encontrei a opção de virtualização
- [ ] Alterei de `Disabled` para `Enabled`
- [ ] Salvei e reiniciei (F10)
- [ ] Verifiquei: `VirtualizationFirmwareEnabled = TRUE`
- [ ] Docker Desktop inicia sem erros

## 🆘 Se Ainda Não Funcionar

### Verificar se o Processador Suporta

```powershell
# Verificar processador
Get-CimInstance Win32_Processor | Select-Object Name, Manufacturer

# Verificar recursos de virtualização
systeminfo | findstr /C:"Hyper-V"
```

### Habilitar Recursos do Windows

```powershell
# Execute como Administrador
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
Enable-WindowsOptionalFeature -Online -FeatureName Containers
```

Reinicie após executar.

### Verificar WSL2

```powershell
# Verificar versão do WSL
wsl --version

# Atualizar para WSL2
wsl --set-default-version 2
```

## 📚 Referências

- [ASUS BIOS Guide](https://www.asus.com/support/faq/1042948/)
- [Docker Desktop Requirements](https://docs.docker.com/desktop/install/windows-install/)

---

**Modelo detectado:** ASUS System Product Name  
**Ação necessária:** Habilitar virtualização no BIOS/UEFI (F2 durante boot)

