/**
 * EditableAvatar Component
 * Componente de avatar editável com upload de foto via câmera ou galeria
 */

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  ActionSheetIOS,
} from 'react-native';

import { profileService } from '../services/profileService';
import { useTheme } from '../theme/ThemeContext';
import { Tokens } from '../theme/tokens';
import { logger } from '../utils/logger';

interface EditableAvatarProps {
  uri?: string | null;
  name: string;
  onAvatarChange?: (newUrl: string | null) => void;
  size?: number;
}

export const EditableAvatar: React.FC<EditableAvatarProps> = ({
  uri,
  name,
  onAvatarChange,
  size = 120,
}) => {
  const { colors } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(uri || null);

  /**
   * Obter iniciais do nome
   */
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  /**
   * Solicitar permissão de câmera
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Você precisa permitir acesso à câmera para tirar fotos. Por favor, ative nas configurações do dispositivo.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  /**
   * Solicitar permissão de galeria
   */
  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Você precisa permitir acesso à galeria para escolher fotos. Por favor, ative nas configurações do dispositivo.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  /**
   * Abrir câmera
   */
  const openCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      logger.error('[EditableAvatar] Erro ao abrir câmera', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera. Tente novamente.');
    }
  };

  /**
   * Abrir galeria
   */
  const openGallery = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      logger.error('[EditableAvatar] Erro ao abrir galeria', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria. Tente novamente.');
    }
  };

  /**
   * Upload de avatar
   */
  const uploadAvatar = async (imageUri: string) => {
    try {
      setUploading(true);
      logger.info('[EditableAvatar] Iniciando upload de avatar');

      const { url, error } = await profileService.uploadAvatar(imageUri);

      if (error || !url) {
        const errorMsg =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : 'Erro ao fazer upload';
        throw new Error(errorMsg);
      }

      logger.info('[EditableAvatar] Upload concluído com sucesso');
      setLocalUri(url);
      onAvatarChange?.(url);

      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error) {
      logger.error('[EditableAvatar] Erro ao fazer upload de avatar', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a foto. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Remover avatar
   */
  const removeAvatar = async () => {
    try {
      setUploading(true);
      logger.info('[EditableAvatar] Removendo avatar');

      const { success, error } = await profileService.deleteAvatar();

      if (!success) {
        const errorMsg =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : 'Erro ao remover foto';
        throw new Error(errorMsg);
      }

      logger.info('[EditableAvatar] Avatar removido com sucesso');
      setLocalUri(null);
      onAvatarChange?.(null);

      Alert.alert('Sucesso', 'Foto de perfil removida com sucesso!');
    } catch (error) {
      logger.error('[EditableAvatar] Erro ao remover avatar', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Não foi possível remover a foto. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Mostrar opções de avatar
   */
  const showAvatarOptions = () => {
    const options = [
      'Tirar foto',
      'Escolher da galeria',
      ...(localUri ? ['Remover foto'] : []),
      'Cancelar',
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: localUri ? 2 : undefined,
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            openCamera();
          } else if (buttonIndex === 1) {
            openGallery();
          } else if (buttonIndex === 2 && localUri) {
            Alert.alert('Remover foto', 'Tem certeza que deseja remover sua foto de perfil?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Remover', style: 'destructive', onPress: removeAvatar },
            ]);
          }
        }
      );
    } else {
      // Android - usar Alert.alert como fallback
      Alert.alert('Foto de perfil', 'Escolha uma opção', [
        { text: 'Tirar foto', onPress: openCamera },
        { text: 'Escolher da galeria', onPress: openGallery },
        ...(localUri
          ? [
              {
                text: 'Remover foto',
                onPress: () => {
                  Alert.alert(
                    'Remover foto',
                    'Tem certeza que deseja remover sua foto de perfil?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Remover', style: 'destructive', onPress: removeAvatar },
                    ]
                  );
                },
                style: 'destructive' as const,
              },
            ]
          : []),
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={showAvatarOptions}
        disabled={uploading}
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.primary.main,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Editar foto de perfil"
        accessibilityHint="Abre opções para alterar ou remover sua foto"
      >
        {localUri ? (
          <Image
            source={{ uri: localUri }}
            style={[styles.avatarImage, { borderRadius: size / 2 }]}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              {
                backgroundColor: colors.primary.light,
                borderRadius: size / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.initialsText,
                {
                  fontSize: size / 3,
                  color: colors.text.primary,
                },
              ]}
            >
              {getInitials(name)}
            </Text>
          </View>
        )}

        {/* Badge de edição */}
        <View
          style={[
            styles.editBadge,
            {
              backgroundColor: colors.primary.main,
              borderColor: colors.background.card,
            },
          ]}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Camera size={16} color={colors.text.inverse} />
          )}
        </View>
      </TouchableOpacity>

      {uploading && (
        <Text
          style={[
            styles.uploadingText,
            {
              color: colors.text.secondary,
              marginTop: Tokens.spacing['2'],
            },
          ]}
        >
          Fazendo upload...
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: Tokens.typography.weights.medium,
  },
});

export default EditableAvatar;
