import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import orderService from '@/lib/orders';

interface ClaimCodeModalProps {
  visible: boolean;
  orderId: number;
  orderNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClaimCodeModal: React.FC<ClaimCodeModalProps> = ({
  visible,
  orderId,
  orderNumber,
  onClose,
  onSuccess,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [loading, setLoading] = useState(false);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible && !claimCode) {
      generateClaimCode();
    }
  }, [visible]);

  useEffect(() => {
    if (expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
          Alert.alert(
            'Code Expired',
            'Your claim code has expired. Please generate a new one.',
            [{ text: 'OK', onPress: onClose }]
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  useEffect(() => {
    if (claimCode) {
      // Start pulsing animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [claimCode]);

  const generateClaimCode = async () => {
    try {
      setLoading(true);
      const result = await orderService.generateClaimCode(orderId);
      setClaimCode(result.code);
      setExpiresAt(result.expires_at);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate claim code');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setClaimCode(null);
    setExpiresAt(null);
    setTimeRemaining(0);
    onClose();
  };

  const handleSuccess = () => {
    onSuccess();
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Claim Your Order
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.orderInfo, { color: colors.text }]}>
              Order #{orderNumber}
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="hourglass-outline" size={48} color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  Generating claim code...
                </Text>
              </View>
            ) : claimCode ? (
              <View style={styles.codeContainer}>
                <Text style={[styles.codeLabel, { color: colors.text }]}>
                  Show this code to the restaurant:
                </Text>
                
                <Animated.View
                  style={[
                    styles.codeBox,
                    { backgroundColor: colors.primary },
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Text style={styles.codeText}>{claimCode}</Text>
                </Animated.View>

                <View style={styles.timerContainer}>
                  <Ionicons name="time-outline" size={16} color={colors.warning} />
                  <Text style={[styles.timerText, { color: colors.warning }]}>
                    Expires in {formatTime(timeRemaining)}
                  </Text>
                </View>

                <View style={styles.instructions}>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    1. Show this code to the restaurant staff
                  </Text>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    2. They will verify the code and mark your order as completed
                  </Text>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    3. Enjoy your meal!
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.footer}>
            {claimCode && (
              <Button
                title="I've Picked Up My Order"
                onPress={handleSuccess}
                variant="primary"
                size="large"
                style={styles.successButton}
              />
            )}
            <Button
              title="Close"
              onPress={handleClose}
              variant="outline"
              size="large"
              style={styles.closeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  orderInfo: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  codeBox: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    width: '100%',
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  successButton: {
    marginBottom: 8,
  },
});
