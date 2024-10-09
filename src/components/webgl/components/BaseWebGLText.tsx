import React from 'react';
import { BaseWebGLTextProps } from '../types';

abstract class BaseWebGLText<T extends BaseWebGLTextProps> extends React.Component<T> {
  abstract renderWebGL(): JSX.Element;

  render() {
    return this.renderWebGL();
  }
}

export default BaseWebGLText;