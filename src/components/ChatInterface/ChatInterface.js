import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ChatInterface({ onMoodSubmit }) {
  const [mood, setMood] = useState('');

  const handleSubmit = () => {
    if (mood.trim()) {
      onMoodSubmit(mood.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* 状态栏 */}
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.statusIcons}>
          <View style={styles.signal} />
          <View style={styles.wifi} />
          <View style={styles.battery} />
        </View>
      </View>

      {/* 主要内容 */}
      <View style={styles.content}>
        {/* 问候区域 */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>HI~</Text>
          <Text style={styles.question}>今天心情怎么样?</Text>
        </View>

        {/* 云朵回复 */}
        <View style={styles.cloudMessage}>
          <Text style={styles.cloudText}>
            你来啦! 今天想和我说什么呢?{'\n'}
            哦对了!今天上海的太阳落下时间是18:34分{'\n'}
            可以放下繁琐,抽点时间看看夕阳~
          </Text>
        </View>

        {/* 输入区域 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputPrompt}>现在的你，是什么感觉呢？</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={mood}
              onChangeText={setMood}
              placeholder="告诉我你的心情..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              numberOfLines={3}
            />
            
            {/* 表情按钮 */}
            <View style={styles.emojiContainer}>
              <TouchableOpacity style={styles.emojiButton}>
                <Text style={styles.emoji}>😊</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emojiButton}>
                <Text style={styles.emoji}>😢</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emojiButton}>
                <Text style={styles.emoji}>😡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emojiButton}>
                <Text style={styles.emoji}>😌</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !mood.trim() && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={!mood.trim()}
          >
            <Text style={styles.sendButtonText}>发送</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 底部指示器 */}
      <View style={styles.homeIndicator}>
        <View style={styles.indicator} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  time: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signal: {
    width: 20,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  wifi: {
    width: 16,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  battery: {
    width: 24,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  greetingContainer: {
    marginTop: 50,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  cloudMessage: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  cloudText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 50,
  },
  inputPrompt: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  emojiButton: {
    padding: 8,
  },
  emoji: {
    fontSize: 24,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeIndicator: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  indicator: {
    width: 128,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 95,
  },
}); 