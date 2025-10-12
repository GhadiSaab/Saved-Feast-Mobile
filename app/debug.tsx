import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { debug } from '@/lib/debug';

export default function DebugScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'debug'>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const allLogs = debug.getLogs();
    setLogs(allLogs);
  };

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  );

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return '#FF6B6B';
      case 'warn': return '#FFA500';
      case 'info': return '#4ECDC4';
      case 'debug': return '#95A5A6';
      default: return colors.text;
    }
  };

  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all debug logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            debug.clearLogs();
            setLogs([]);
          },
        },
      ]
    );
  };

  const exportLogs = async () => {
    try {
      const logData = debug.exportLogs();
      await Share.share({
        message: logData,
        title: 'SavedFeast Debug Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatLogMessage = (log: any) => {
    const context = log.context;
    const contextStr = context ? 
      `[${context.component || 'Unknown'}${context.orderId ? `:${context.orderId}` : ''}${context.userId ? `:User${context.userId}` : ''}]` : 
      '';
    
    return `${contextStr} ${log.message}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Debug Logs</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadLogs} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={exportLogs} style={styles.exportButton}>
            <Ionicons name="share" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
            <Ionicons name="trash" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <View style={styles.filters}>
        {(['all', 'error', 'warn', 'info', 'debug'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === level ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setFilter(level)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === level ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {level.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.logsContainer}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.text} />
            <ThemedText style={styles.emptyText}>No logs found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {filter === 'all' ? 'No debug logs available' : `No ${filter} logs found`}
            </ThemedText>
          </View>
        ) : (
          filteredLogs.map((log, index) => (
            <View key={index} style={[styles.logItem, { borderColor: colors.border }]}>
              <View style={styles.logHeader}>
                <View style={styles.logLevelContainer}>
                  <View
                    style={[
                      styles.logLevelIndicator,
                      { backgroundColor: getLogColor(log.level) },
                    ]}
                  />
                  <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                    {log.level.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.logTimestamp, { color: colors.text }]}>
                  {formatTimestamp(log.timestamp)}
                </Text>
              </View>
              
              <Text style={[styles.logMessage, { color: colors.text }]}>
                {formatLogMessage(log)}
              </Text>
              
              {log.data && (
                <View style={[styles.logData, { backgroundColor: colors.card }]}>
                  <Text style={[styles.logDataText, { color: colors.text }]}>
                    {JSON.stringify(log.data, null, 2)}
                  </Text>
                </View>
              )}
              
              {log.stack && (
                <View style={[styles.logStack, { backgroundColor: colors.card }]}>
                  <Text style={[styles.logStackText, { color: colors.text }]}>
                    {log.stack}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Total logs: {logs.length} | Showing: {filteredLogs.length}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
  },
  exportButton: {
    padding: 8,
  },
  clearButton: {
    padding: 8,
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  logItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logLevelIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  logTimestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  logMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  logData: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  logDataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  logStack: {
    padding: 8,
    borderRadius: 4,
  },
  logStackText: {
    fontSize: 10,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});
