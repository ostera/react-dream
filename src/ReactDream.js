import compose from 'recompose/compose'
import setDisplayName from 'recompose/setDisplayName'
import doAp from './internals/doAp'
import doContramap from './internals/doContramap'
import doMap from './internals/doMap'
import doPromap from './internals/doPromap'
import doDebug from './internals/doDebug'
import doLog from './internals/doLog'
import doRotate from './internals/doRotate'
import doTranslate from './internals/doTranslate'
import doScale from './internals/doScale'
import styleFromProps from './styleFromProps'

// ALGEBRAS
// ////////////////////////////////////////////////////////////////////////// //

// ap : higherOrderComponent -> ReactDream -> ReactDream
const ap = higherOrderComponent => ReactDreamComponent =>
  ReactDream(doAp(higherOrderComponent)(ReactDreamComponent))

// chain : Component -> (Component -> ReactDream) -> ReactDream
const chain = Component => kleisliReactDreamComponent => kleisliReactDreamComponent(Component)

// map : Component -> (Component -> Component) -> ReactDream
const map = Component => higherOrderComponent => ReactDream(doMap(higherOrderComponent)(Component))

// contramap : Component -> (a -> Props) -> ReactDream
const contramap = Component => propsPreprocessor =>
  ReactDream(doContramap(propsPreprocessor)(Component))

// promap : Component -> (a -> Props) -> (Component -> Component) -> ReactDream
const promap = Component => (propsPreprocessor, higherOrderComponent) =>
  ReactDream(doPromap(propsPreprocessor, higherOrderComponent)(Component))

// CUSTOM HELPERS
// ////////////////////////////////////////////////////////////////////////// //

// addProps : Component -> (Props -> Props) -> ReactDream
const addProps = Component => getPropsToAdd =>
  contramap(Component)(props => ({
    ...getPropsToAdd(props),
    ...props,
  }))

// fork : Component -> (Component -> a) -> a
const fork = Component => extractComponent => extractComponent(Component)

// debug : Component -> () -> IO ReactDream
const debug = Component => () => ReactDream(doDebug(Component))

// log : Component -> String -> IO ReactDream
const log = Component => text => ReactDream(doLog(text)(Component))

// name : Component -> String -> ReactDream
const name = Component => compose(map(Component), setDisplayName)

// removeProps : Component -> (...Array) -> ReactDream
const removeProps = Component => (...propsToRemove) =>
  contramap(Component)(props => {
    // Nasty but efficient
    const propsCopy = { ...props }
    propsToRemove.forEach(propName => {
      delete propsCopy[propName]
    })
    return propsCopy
  })

// translate : Component -> (Props -> [Number]) -> ReactDream
const translate = Component => getTranslateFromProps =>
  ReactDream(doTranslate(getTranslateFromProps)(Component))

// rotate : Component -> (Props -> Number) -> ReactDream
const rotate = Component => getRotateFromProps =>
  ReactDream(doRotate(getRotateFromProps)(Component))

// scale : Component -> (Props -> Number) -> ReactDream
const scale = Component => getScaleFromProps => ReactDream(doScale(getScaleFromProps)(Component))

// style : Component -> (Props -> Style) -> ReactDream
const style = Component => getStyleFromProps =>
  contramap(Component)(styleFromProps(getStyleFromProps))

// TYPE
// ////////////////////////////////////////////////////////////////////////// //

// ReactDream : Component -> ReactDream
const ReactDream = Component => ({
  Component,

  // Algebras
  ap: ap(Component),
  chain: chain(Component),
  contramap: contramap(Component),
  map: map(Component),
  promap: promap(Component),

  // Custom helpers
  addProps: addProps(Component),
  fork: fork(Component),
  name: name(Component),
  removeProps: removeProps(Component),
  style: style(Component),
  log: log(Component),
  debug: debug(Component),
  rotate: rotate(Component),
  scale: scale(Component),
  translate: translate(Component),
})

ReactDream.of = ReactDream

export const of = ReactDream.of

export default ReactDream
