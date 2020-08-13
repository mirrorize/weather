/* global CustomElement */
export default class extends CustomElement {
  get isShadow () {
    return true
  }

  get hidable () {
    return true
  }

  get reconfigurable () {
    return true
  }

  defaultContent () {
    return '<style>:host{ display: block; } </style><div>This is default</div>'
  }
}
