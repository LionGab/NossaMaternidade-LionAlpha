# 🔧 Docker Desktop - Virtualização Não Detectada

## Problema

```
Docker Desktop failed to start because virtualisation support wasn't detected.
```

## Diagnóstico

O problema ocorre quando a virtualização não está habilitada no BIOS/UEFI do sistema.

**Status atual:**
- ✅ Hyper-V disponível no Windows
- ❌ Virtualização desabilitada no BIOS/UEFI

## Solução

### Passo 1: Habilitar Virtualização no BIOS/UEFI

1. **Reinicie o computador**
2. **Acesse o BIOS/UEFI:**
   - Durante a inicialização, pressione a tecla apropriada:
     - **Dell/HP:** `F2` ou `F12`
     - **ASUS:** `F2` ou `Delete`
     - **Lenovo:** `F1` ou `F2`
     - **Acer:** `F2` ou `Delete`
     - **MSI:** `Delete`
   - Ou use o Windows Recovery:
     - Settings → Update & Security → Recovery → Advanced startup → Restart now
     - Troubleshoot → Advanced options → UEFI Firmware Settings

3. **Localize a opção de virtualização:**
   - Procure por uma das seguintes opções:
     - `Virtualization Technology (VT-x)` (Intel)
     - `AMD-V` (AMD)
     - `SVM Mode` (AMD)
     - `Intel Virtualization Technology`
     - Geralmente em: `Advanced` → `CPU Configuration` ou `Security`

4. **Habilite a virtualização:**
   - Mude de `Disabled` para `Enabled`
   - Salve e saia (geralmente `F10`)

5. **Reinicie o Windows**

### Passo 2: Verificar se Funcionou

Execute no PowerShell (como Administrador):

```powershell
# Verificar virtualização no firmware
wmic cpu get VirtualizationFirmwareEnabled

# Deve retornar: TRUE
```

### Passo 3: Habilitar Recursos do Windows (se necessário)

Se ainda não funcionar, habilite os recursos do Windows:

```powershell
# Execute como Administrador
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
Enable-WindowsOptionalFeature -Online -FeatureName Containers
```

Reinicie após habilitar.

### Passo 4: Verificar WSL2 (Alternativa)

Se o Docker Desktop usar WSL2:

```powershell
# Verificar versão do WSL
wsl --version

# Atualizar para WSL2 (se necessário)
wsl --set-default-version 2

# Verificar distribuições
wsl --list --verbose
```

## Alternativas

### Opção 1: Docker sem Virtualização (Windows Containers)

Se não conseguir habilitar virtualização, use Windows Containers:

1. Abra Docker Desktop
2. Settings → General
3. Desmarque "Use the WSL 2 based engine"
4. Aplique e reinicie

**Limitação:** Apenas containers Windows (não Linux).

### Opção 2: Usar Docker via WSL2 Diretamente

Se WSL2 estiver funcionando:

```bash
# Dentro do WSL2
sudo apt update
sudo apt install docker.io
sudo service docker start
```

### Opção 3: Usar Podman (Alternativa ao Docker)

Podman não requer virtualização no Windows:

```powershell
# Instalar via Chocolatey
choco install podman

# Ou baixar de: https://podman.io/getting-started/installation
```

## Verificação Final

Após habilitar virtualização:

```powershell
# 1. Verificar virtualização
wmic cpu get VirtualizationFirmwareEnabled
# Deve retornar: TRUE

# 2. Verificar Hyper-V
systeminfo | findstr /C:"Hyper-V"
# Deve mostrar requisitos atendidos

# 3. Iniciar Docker Desktop
# Deve iniciar sem erros
```

## Troubleshooting Adicional

### Erro: "Virtualization is disabled in the firmware"

**Solução:** Siga o Passo 1 acima (habilitar no BIOS/UEFI).

### Erro: "WSL 2 installation is incomplete"

**Solução:**
```powershell
# Atualizar kernel do WSL2
wsl --update

# Definir WSL2 como padrão
wsl --set-default-version 2
```

### Erro: "Hardware assisted virtualization and data execution protection must be enabled"

**Solução:**
1. Verifique se DEP está habilitado:
   ```powershell
   bcdedit /enum {current} | findstr /C:"nx"
   ```
2. Se não estiver, habilite:
   ```powershell
   bcdedit /set {current} nx OptIn
   ```

## Referências

- [Docker Desktop for Windows - System Requirements](https://docs.docker.com/desktop/install/windows-install/)
- [Enable Virtualization in BIOS](https://support.microsoft.com/en-us/windows/enable-virtualization-in-windows-11-a0b3b327-37c2-40b0-98ad-fc32044ab976)
- [WSL2 Installation Guide](https://learn.microsoft.com/en-us/windows/wsl/install)

---

**Status:** ⚠️ Requer ação manual (habilitar no BIOS/UEFI)

**Última atualização:** Dezembro 2025

