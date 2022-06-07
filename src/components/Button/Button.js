import styled, { css } from 'styled-components'

export default function Button({ color, size, ...props }) {
  const onClick = () => {
    if (typeof props.onClick === 'function') {
      props.onClick()
    }
  }

  return (
    <Style onClick={onClick} color={color} size={size} {...props}>
      {props.children}
    </Style>
  )
}

export const Style = styled.button`
  color: var(--background);
  padding: 10px 25px 11px;
  border-radius: 100px;
  font-size: var(--font-text);
  text-align: center;
  cursor: pointer;
  font-weight: 400;
  border: none;
  outline: none;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.25s all var(--transition);
  white-space: nowrap;
  color: #fff;

  svg {
    height: 18px !important;
    width: 18px !important;
    transition: 0.25s all var(--transition);

    &:first-child:not(:last-child) {
      margin-right: 10px;
    }

    &:last-child:not(:first-child) {
      margin-left: 10px;
    }
  }

  &:hover {
    svg {
      &:last-child:not(:first-child) {
        transform: translateX(3px);
      }
    }
  }

  ${(props) =>
    props.color === 'primary' &&
    css`
      background-color: var(--primary);
      border: 1px solid var(--primary);
      &:hover {
        background-color: var(--primary-hover);
      }
    `}

  ${(props) =>
    props.color === 'default' &&
    css`
      background-color: var(--background);
      border: 1px solid var(--border-light);
      color: #000;

      svg {
        color: #000;
      }

      &:hover {
      }
    `}

    ${(props) =>
    props.color === 'inverse' &&
    css`
      background-color: var(--inverse);
      border: 1px solid var(--inverse-border);
      color: var(--inverse-text);

      svg {
        color: var(--inverse-text);
      }

      &:hover {
        background-color: var(--inverse-hover);
      }
    `}

    ${(props) =>
    props.outline === 'default' &&
    css`
      border: 1px solid var(--inverse-border);

      svg {
      }

      &:hover {
      }
    `}


    ${(props) =>
    props.outline === 'inverse' &&
    css`
      border: 1px solid #fff;

      svg {
      }

      &:hover {
      }
    `}

    
  ${(props) =>
    props.size === 'small' &&
    css`
      padding: 6px 16px;
      font-size: var(--font-xs);

      svg {
        height: 10px !important;
        width: 10px !important;
      }
    `}


    ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}

    ${(props) =>
    props.inline &&
    css`
      width: auto;
    `}
`
