<template>
    <div class="rgb-setup">
        <!-- Settings section -->
        <div class="mb-4 flex gap-2">
          <label class="flex items-center gap-2">
            <input v-model="userSettings.reduceKeymapColors" type="checkbox" class="checkbox" />
            <span>Reduce keymap colors</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="userSettings.autoSelectNextKey" type="checkbox" class="checkbox" />
            <span>Auto-select next key</span>
          </label>
        </div>

    </div>
  </template>
  
  <script lang="ts" setup>
  import { keyboardStore, selectedKeys, selectedLayer, userSettings } from '../store'
  import { onMounted, ref } from 'vue'
  import HsvColorPicker from './HsvColorPicker.vue'
  
  const rgbPin = ref('')
  const rgbKeyPin = ref('')
  const rgbNumLeds = ref('')
  const rgbKeyNumLeds = ref('')
  const rgbAnimationMode = ref(0)
  const rgbAnimationSpeed = ref(0)
  const rgbBreatheCenter = ref(0)
  const rgbKnightEffectLength = ref(0)
  const rgbEnabled = ref(false)
  const rgbKeyEnabled = ref(false)
  const rgbKeyAnimationMode = ref(0)
  const rgbKeyAnimationSpeed = ref(0)
  const rgbKeyBreatheCenter = ref(0)
  const rgbKeyKnightEffectLength = ref(0)
  
  onMounted(() => {
    rgbKeyPin.value = keyboardStore.rgbKeyPin
    rgbPin.value = keyboardStore.rgbPin
    rgbNumLeds.value = String(keyboardStore.rgbNumLeds)
    rgbKeyNumLeds.value = String(keyboardStore.rgbKeyNumLeds)
    rgbAnimationMode.value = keyboardStore.rgbOptions.animationMode
    rgbAnimationSpeed.value = keyboardStore.rgbOptions.animationSpeed
    rgbBreatheCenter.value = keyboardStore.rgbOptions.breatheCenter
    rgbKnightEffectLength.value = keyboardStore.rgbOptions.knightEffectLength
    rgbKeyAnimationMode.value = keyboardStore.rgbKeyOptions.animationMode
    rgbKeyAnimationSpeed.value = keyboardStore.rgbKeyOptions.animationSpeed
    rgbKeyBreatheCenter.value = keyboardStore.rgbKeyOptions.breatheCenter
    rgbKeyKnightEffectLength.value = keyboardStore.rgbKeyOptions.knightEffectLength
  
    rgbEnabled.value = keyboardStore.kbFeatures.some((feature) => feature.toLowerCase() === 'rgb')
    rgbKeyEnabled.value = keyboardStore.kbFeatures.some(
      (feature) => feature.toLowerCase() === 'rgbkey'
    )
  })
  
  
  const savePin = () => {
    keyboardStore.rgbPin = rgbPin.value
  }
  
  const saveKeyPin = () => {
    keyboardStore.rgbKeyPin = rgbKeyPin.value
  }
  
  const saveNumLeds = () => {
    keyboardStore.rgbNumLeds = Number(rgbNumLeds.value)
  }
  
  const saveKeyNumLeds = () => {
    keyboardStore.rgbKeyNumLeds = Number(rgbKeyNumLeds.value)
  }
  
  const saveMode = () => {
    keyboardStore.rgbOptions.animationMode = Number(rgbAnimationMode.value)
  }
  
  const saveAnimationSpeed = () => {
    keyboardStore.rgbOptions.animationSpeed = Number(rgbAnimationSpeed.value)
  }
  
  
  const saveBreatheCenter = () => {
    keyboardStore.rgbOptions.breatheCenter = Number(rgbBreatheCenter.value)
  }
  
  const saveKnightEffectLength = () => {
    keyboardStore.rgbOptions.knightEffectLength = Number(rgbKnightEffectLength.value)
  }
  
  const saveKeyMode = () => {
    keyboardStore.rgbKeyOptions.animationMode = Number(rgbKeyAnimationMode.value)
  }
  
  const saveKeyAnimationSpeed = () => {
    keyboardStore.rgbKeyOptions.animationSpeed = Number(rgbKeyAnimationSpeed.value)
  }
  
  const saveKeyBreatheCenter = () => {
    keyboardStore.rgbKeyOptions.breatheCenter = Number(rgbKeyBreatheCenter.value)
  }
  
  const saveKeyKnightEffectLength = () => {
    keyboardStore.rgbKeyOptions.knightEffectLength = Number(rgbKeyKnightEffectLength.value)
  }
  
  const saveColor = (hsvColor) => {
    keyboardStore.rgbOptions.hueDefault = hsvColor.hue
    keyboardStore.rgbOptions.satDefault = hsvColor.sat
    keyboardStore.rgbOptions.valDefault = hsvColor.val
  }
  
  const saveKeyColor = (hsvColor) => {
    keyboardStore.rgbKeyOptions.hueDefault = hsvColor.hue
    keyboardStore.rgbKeyOptions.satDefault = hsvColor.sat
    keyboardStore.rgbKeyOptions.valDefault = hsvColor.val
  }
  
  const toggleRgbEnabled = () => {
    if (keyboardStore.kbFeatures.some((feature) => feature.toLowerCase() === 'rgb')) {
      keyboardStore.kbFeatures = keyboardStore.kbFeatures.filter(
        (feature) => feature.toLowerCase() !== 'rgb'
      )
    } else {
      keyboardStore.kbFeatures.push('rgb')
    }
  }
  
  const toggleKeyRgbEnabled = () => {
    if (keyboardStore.kbFeatures.some((feature) => feature.toLowerCase() === 'rgbkey')) {
      keyboardStore.kbFeatures = keyboardStore.kbFeatures.filter(
        (feature) => feature.toLowerCase() !== 'rgbkey'
      )
    } else {
      keyboardStore.kbFeatures.push('rgbkey')
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .rgb-setup {
    width: 100%;
    height: 100%;
    padding: 1rem;
  }
  </style>
  