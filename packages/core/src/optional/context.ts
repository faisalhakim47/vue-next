import { observable } from '@vue/observer'
import { Component } from '../component'
import { warn } from '../warning'

const contextStore = observable() as Record<string | symbol, any>

interface ProviderProps {
  id: string | symbol
  value: any
}

export class Provide extends Component<ProviderProps> {
  static props = {
    id: {
      type: [String, Symbol],
      required: true
    },
    value: {
      required: true
    }
  }

  updateValue() {
    // TS doesn't allow symbol as index :/
    // https://github.com/Microsoft/TypeScript/issues/24587
    contextStore[this.$props.id as string] = this.$props.value
  }
  created() {
    if (__DEV__) {
      const { id } = this.$props
      if (contextStore.hasOwnProperty(id)) {
        warn(`A context provider with id ${id.toString()} already exists.`)
      }
      this.$watch(
        () => this.$props.id,
        (id: string, oldId: string) => {
          warn(
            `Context provider id change detected (from "${oldId}" to "${id}"). ` +
              `This is not supported and should be avoided.`
          )
        },
        { sync: true }
      )
    }
    this.updateValue()
  }
  beforeUpdate() {
    this.updateValue()
  }
  render(props: any, slots: any) {
    return slots.default && slots.default()
  }
}

export class Inject extends Component {
  render(props: any, slots: any) {
    return slots.default && slots.default(contextStore[props.id])
  }
}