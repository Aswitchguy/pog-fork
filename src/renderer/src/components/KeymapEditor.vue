<template>
  <div class="main-container">
    <!-- Left side - Key Editor -->
    <div class="left-panel overflow-auto" :style="{ width: leftPanelWidth + 'px' }">
      <div class="p-4">
        <!-- Settings section -->
        <div v-if="settingsOpen" class="mb-4 flex gap-2">
          <label class="flex items-center gap-2">
            <input v-model="userSettings.reduceKeymapColors" type="checkbox" class="checkbox" />
            <span>Reduce keymap colors</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="userSettings.autoSelectNextKey" type="checkbox" class="checkbox" />
            <span>Auto-select next key</span>
          </label>
        </div>

        <!-- Key options and picker -->
        <div class="my-4">
          <p class="mb-2 text-sm font-bold">
            Keycode Options for Selected Key(s)
            <span class="text-sm text-warning">{{ coordMapWarning }}</span>
          </p>
          <div class="flex gap-2">
            <select
              v-model="keycodeModeForSelection"
              class="select select-bordered select-sm"
              @change="switchedKeyCodeType"
            >
              <option value="simple">Simple</option>
              <option value="string">String</option>
              <option value="macro">Macro</option>
              <option value="tapdance">Tap Dance</option>
              <option value="custom">Custom</option>
            </select>
            <div class="flex-grow">
              <input
                v-model="currentKeyCode"
                :disabled="selectedKeys.size === 0"
                type="text"
                class="input input-bordered input-sm w-full"
              />
            </div>
          </div>
        </div>

        <KeyPicker @setKey="setKey" />
      </div>
    </div>

    <!-- Resizer -->
    <div
      class="resizer"
      @mousedown="startResize"
      @dblclick="resetWidth"
    ></div>

    <!-- Right side - Layer Preview -->
    <div class="right-panel flex-1 overflow-hidden">
      <!-- Fixed header -->
      <div class="layer-header-fixed border-b border-base-300 bg-base-200 p-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Layouts</h2>
          <div class="flex gap-2">
            <button class="btn btn-sm" @click="addLayer">
              <i class="mdi mdi-plus"></i>
              Add Layer
            </button>
            <button 
              class="btn btn-sm" 
              :disabled="keyboardStore.keymap.length === 1" 
              @click="removeLayer"
            >
              <i class="mdi mdi-trash-can"></i>
              Remove
            </button>
            <button class="btn btn-sm" @click="duplicateLayer">
              <i class="mdi mdi-content-duplicate"></i>
              Duplicate
            </button>
          </div>
        </div>
      </div>

      <!-- Scrollable content -->
      <div class="layer-content overflow-auto">
        <div class="p-4">
          <div class="layers-scroll">
            <div 
              v-for="(layer, index) in keyboardStore.layers" 
              :key="index" 
              class="layer-preview snap-start"
              :class="{ 'active': selectedLayer === index }"
              @click="selectedLayer = index"
            >
              <div class="layer-header mb-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span 
                    v-if="!editingLayer[index]" 
                    class="text-lg font-bold cursor-pointer" 
                    :style="{ color: layer.color }"
                    @click="startEditingLayer(index)"
                  >
                    Layer {{ index }}: {{ layer.name }}
                  </span>
                  <input
                    v-else
                    v-model="layer.name"
                    class="input input-bordered input-sm"
                    @blur="stopEditingLayer(index)"
                    @keyup.enter="stopEditingLayer(index)"
                    ref="layerNameInput"
                    :style="{ color: layer.color }"
                  />
                </div>
              </div>

              <div class="keyboard-preview" :class="{ 'opacity-50': selectedLayer !== index }">
                <keyboard-layout
                  :key-layout="keyboardStore.keys"
                  :keymap="keyboardStore.keymap"
                  :matrix-width="keyboardStore.cols"
                  :layouts="keyboardStore.layouts"
                  :layer="index"
                  mode="keymap"
                  fixed-height
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { keyboardStore, selectedKeys, selectedLayer, userSettings } from '../store'
import KeyboardLayout from './KeyboardLayout.vue'
import KeyPicker from './KeyPicker.vue'
import { cleanupKeymap, selectNextKey } from '../helpers'
import { computed, ref, onMounted, nextTick } from 'vue'
import KeymapLayer from './KeymapLayer.vue'

selectedKeys.value.clear()

const keycodeModeForSelection = ref<
  'simple' | 'combo' | 'macro' | 'custom' | 'tapdance' | 'string'
>('simple')
const setKey = (keyCode: string) => {
  selectedKeys.value.forEach((index) => {
    keyboardStore.keys[index].setOnKeymap(keyCode)
  })
  // if one key is selected select the next
  // TODO: only select visible keys
  if (selectedKeys.value.size === 1 && userSettings.value.autoSelectNextKey) {
    selectNextKey()
  }
}
cleanupKeymap()
const addLayer = () => {
  if (!keyboardStore.keymap[0]) {
    keyboardStore.keymap.push(Array(keyboardStore.cols * keyboardStore.rows).fill('KC.TRNS'))
  }
  const tmpKeymap = [...keyboardStore.keymap[0]]
  tmpKeymap.fill('KC.TRNS')
  keyboardStore.keymap.push(tmpKeymap)

  // Add a new layer to the layers array
  keyboardStore.layers.push({
    name: `Layer ${keyboardStore.layers.length}`,
    color: undefined
  })

  // if needed also add an encoder layer
  const encoderCount = keyboardStore.encoders.length
  if (encoderCount !== 0) {
    keyboardStore.encoderKeymap.push(Array(encoderCount).fill(['KC.TRNS', 'KC.TRNS']))
  }
}
const removeLayer = () => {
  if (keyboardStore.keymap.length <= 1) return

  // if needed also remove the encoder layer
  const encoderCount = keyboardStore.encoders.length
  if (encoderCount !== 0) {
    keyboardStore.encoderKeymap.splice(selectedLayer.value, 1)
  }
  keyboardStore.layers.splice(selectedLayer.value, 1)
  keyboardStore.keymap.splice(selectedLayer.value, 1)
  if (selectedLayer.value === keyboardStore.keymap.length - 1 && selectedLayer.value !== 0) {
    selectedLayer.value = keyboardStore.keymap.length - 2
  }
}
const duplicateLayer = () => {
  // Duplicate keymap
  keyboardStore.keymap.push([...keyboardStore.keymap[selectedLayer.value]])
  
  // Duplicate layer metadata
  const currentLayer = keyboardStore.layers[selectedLayer.value]
  keyboardStore.layers.push({
    name: `${currentLayer.name} (Copy)`,
    color: currentLayer.color
  })

  // Duplicate encoder layer if needed
  const encoderCount = keyboardStore.encoders.length
  if (encoderCount !== 0) {
    keyboardStore.encoderKeymap.push([...keyboardStore.encoderKeymap[selectedLayer.value]])
  }
}
const currentKeyCode = computed({
  get() {
    const keys = keyboardStore.keys.filter((_k, index) => selectedKeys.value.has(index))
    if (keys.length === 0) return 'No key selected'
    const actions: string[] = []
    keys.forEach((key) => {
      actions.push(keyboardStore.getActionForKey({ key, layer: selectedLayer.value }))
    })

    return actions[0]
  },
  set(newVal) {
    if (newVal === '▽') return
    if (selectedKeys.value.size === 0) return
    const keys = keyboardStore.keys.filter((_k, index) => selectedKeys.value.has(index))
    keys.forEach((key) => {
      key.setOnKeymap(newVal)
    })
  }
})
const switchedKeyCodeType = () => {
  console.log(keycodeModeForSelection.value)
  const keys = keyboardStore.keys.filter((_k, index) => selectedKeys.value.has(index))
  keys.forEach((key) => {
    if (keycodeModeForSelection.value === 'macro') {
      key.setOnKeymap('KC.MACRO((KC.A, KC.B))')
    } else if (keycodeModeForSelection.value === 'string') {
      key.setOnKeymap('send_string("")')
    } else if (keycodeModeForSelection.value === 'tapdance') {
      key.setOnKeymap('KC.TD(KC.A,KC.B)')
    } else if (keycodeModeForSelection.value === 'custom') {
      key.setOnKeymap('customkeys.MyKey')
    }
  })
}
const settingsOpen = ref(false)
const toggleSettings = () => {
  settingsOpen.value = !settingsOpen.value
}

const coordMapWarning = computed(() => {
  // show if any of the selected keys does not have and idx
  const keys = keyboardStore.keys.filter((_k, index) => selectedKeys.value.has(index))
  if (keys.length === 0) return ''
  console.log(keys, keys[0].coordMapIndex)
  if (keys.some((key) => typeof key.coordMapIndex !== 'number')) {
    return '⚠️ no coordmap index set in the layout for this key'
  }
  return ''
})

const editingLayer = ref<{ [key: number]: boolean }>({})
const layerNameInput = ref<HTMLInputElement | null>(null)

const startEditingLayer = (index: number) => {
  editingLayer.value[index] = true
  // Focus the input on next tick after it's rendered
  nextTick(() => {
    if (layerNameInput.value) {
      layerNameInput.value.focus()
    }
  })
}

const stopEditingLayer = (index: number) => {
  editingLayer.value[index] = false
}

// Add back resize functionality
const leftPanelWidth = ref(600) // Initial width
const isDragging = ref(false)

const startResize = (e: MouseEvent) => {
  isDragging.value = true
  const startX = e.clientX
  const startWidth = leftPanelWidth.value

  const doDrag = (e: MouseEvent) => {
    if (!isDragging.value) return
    const newWidth = startWidth + (e.clientX - startX)
    leftPanelWidth.value = Math.max(300, Math.min(newWidth, window.innerWidth - 400))
  }

  const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', doDrag)
    document.removeEventListener('mouseup', stopDrag)
  }

  document.addEventListener('mousemove', doDrag)
  document.addEventListener('mouseup', stopDrag)
}

const resetWidth = () => {
  leftPanelWidth.value = 600 // Reset to default width
}

// Add event listener for window resize
onMounted(() => {
  window.addEventListener('resize', () => {
    if (leftPanelWidth.value > window.innerWidth - 400) {
      leftPanelWidth.value = window.innerWidth - 400
    }
  })
})
</script>

<style lang="scss" scoped>
.main-container {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.left-panel {
  width: 400px; // Fixed width
  min-width: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
}

.right-panel {
  flex: 1;
  min-width: 800px; // Ensure enough space for layer content
  display: flex;
  flex-direction: column;
}

.layer-header-fixed {
  flex-shrink: 0;
}

.layer-content {
  flex-grow: 1;
  height: 0; // Required for proper scrolling
}

.layers-scroll {
  scroll-behavior: smooth;
}

.layer-preview {
  height: 400px;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0.5rem;
  margin-bottom: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &.active {
    background: rgba(255, 255, 255, 0.03);
  }
}

.keyboard-preview {
  transform: scale(0.95);
  transform-origin: center;
  transition: all 0.3s ease;
  height: 380px;
  
  display: flex;
  justify-content: center;
  align-items: center;

  user-select: none;
  -webkit-user-select: none;
}

.layer-header {
  .input {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 1.125rem;
    font-weight: bold;
    
    &:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.3);
    }
  }
}

.resizer {
  width: 4px;
  cursor: col-resize;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  transition: background 0.2s;

  &:hover, &:active {
    background: rgba(255, 255, 255, 0.2);
  }

  &::after {
    content: "";
    position: absolute;
    left: -3px;
    right: -3px;
    top: 0;
    bottom: 0;
    z-index: 10;
  }
}

.left-panel {
  min-width: 300px;
}

.right-panel {
  min-width: 400px;
}
</style>
