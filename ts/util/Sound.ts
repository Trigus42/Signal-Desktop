// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import * as log from '../logging/log';

export enum SoundType {
  Message = 'message',
  Call = 'call',
  Reaction = 'reaction',
  Notification = 'notification',
  CallingHangUp = 'calling-hang-up',
  CallingHandRaised = 'calling-hand-raised',
  CallingPresenting = 'calling-presenting',
  VoiceNoteEnd = 'voice-note-end',
  VoiceNoteStart = 'voice-note-start',
  VoiceNoteSend = 'voice-note-send',
}

export const SOUND_TYPE_DISPLAY_NAMES: Record<SoundType, string> = {
  [SoundType.Message]: 'Message Received',
  [SoundType.Call]: 'Ringtone',
  [SoundType.Reaction]: 'Reaction Notification',
  [SoundType.Notification]: 'Default Notification',
  [SoundType.CallingHangUp]: 'Calling Hang Up',
  [SoundType.CallingHandRaised]: 'Calling Hand Raised',
  [SoundType.CallingPresenting]: 'Calling Presenting',
  [SoundType.VoiceNoteEnd]: 'Voice Note End',
  [SoundType.VoiceNoteStart]: 'Voice Note Start',
  [SoundType.VoiceNoteSend]: 'Voice Note Send',
};

export type SoundInfo = {
  id: string;
  name: string;
  path: string;
}

export type SoundPreferences = {
  [key in SoundType]?: string;
}

const BUILT_IN_SOUNDS_PRE: Record<string, {
  name: string;
  path: string;
}> = {
  'message-1': {
    name: 'Message Received 1',
    path: 'sounds/pop.ogg'
  },
  'call-1': {
    name: 'Ringtone 1',
    path: 'sounds/ringtone_minimal.ogg'
  },
  'reaction-1': {
    name: 'Reaction Notification 1',
    path: 'sounds/notification.ogg'
  },
  'notification-1': {
    name: 'Default Notification 1',
    path: 'sounds/notification.ogg'
  },
  'calling-hang-up-1': {
    name: 'Calling Hang Up 1',
    path: 'sounds/navigation-cancel.ogg'
  },
  'calling-hand-raised-1': {
    name: 'Calling Hand Raised 1',
    path: 'sounds/notification_simple-01.ogg'
  },
  'calling-presenting-1': {
    name: 'Calling Presenting 1',
    path: 'sounds/navigation_selection-complete-celebration.ogg'
  },
  'voice-note-end-1': {
    name: 'Voice Note End 1',
    path: 'sounds/state-change_confirm-up.ogg'
  },
  'voice-note-start-1': {
    name: 'Voice Note Start 1',
    path: 'sounds/state-change_confirm-down.ogg'
  },
  'voice-note-send-1': {
    name: 'Voice Note Send 1',
    path: 'sounds/whoosh.ogg'
  },
}

export const BUILT_IN_SOUNDS: Record<string, SoundInfo> = Object.fromEntries(
  Object.entries(BUILT_IN_SOUNDS_PRE).map(([id, infos]) => [
    id,
    {id, ...infos}
  ])
)

export const DEFAULT_SOUNDS: {
  [key in SoundType]: keyof typeof BUILT_IN_SOUNDS;
} = {
  [SoundType.Message]: 'message-1',
  [SoundType.Call]: 'call-1',
  [SoundType.Reaction]: 'reaction-1',
  [SoundType.Notification]: 'notification-1',
  [SoundType.CallingHangUp]: 'calling-hang-up-1',
  [SoundType.CallingHandRaised]: 'calling-hand-raised-1',
  [SoundType.CallingPresenting]: 'calling-presenting-1',
  [SoundType.VoiceNoteEnd]: 'voice-note-end-1',
  [SoundType.VoiceNoteStart]: 'voice-note-start-1',
  [SoundType.VoiceNoteSend]: 'voice-note-send-1',
};

export type SoundOpts = {
  soundType: SoundType;
  soundInfo?: SoundInfo;
  loop?: boolean;
}

export class Sound {
  private readonly audio: HTMLAudioElement;
  private type: SoundType;
  private soundInfo: SoundInfo;

  constructor({ soundType, soundInfo, loop = false }: SoundOpts) {
    this.type = soundType;

    soundInfo = soundInfo || BUILT_IN_SOUNDS[DEFAULT_SOUNDS[soundType]];
    if (!soundInfo) {
      throw new Error(`Found no sound for sound type ${soundType}`);
    }
    this.soundInfo = soundInfo;

    this.audio = new Audio();
    this.audio.loop = loop;
    this.audio.src = this.soundInfo.path;
    this.audio.preload = 'auto';
  }

  async play(): Promise<void> {
    try {
      await this.audio.play();
    } catch (err) {
      log.error(`Error playing sound "${this.soundInfo.name ?? this.soundInfo.id}" (${this.type}): ${err.stack || err}`);
    }
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}

