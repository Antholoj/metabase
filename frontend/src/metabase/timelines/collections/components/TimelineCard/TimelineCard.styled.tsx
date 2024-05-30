import { css, type Theme } from "@emotion/react";
import styled from "@emotion/styled";

import Link from "metabase/core/components/Link";
import Markdown from "metabase/core/components/Markdown";
import { color } from "metabase/lib/colors";
import { Icon } from "metabase/ui";

export const CardIcon = styled(Icon)`
  color: var(--mb-color-text-light);
  width: 1.375rem;
  height: 1.375rem;
`;

export const CardBody = styled.span`
  display: block;
  flex: 1 1 auto;
  margin: 0 1.75rem;
  min-width: 0;
`;

export const CardTitle = styled.span`
  display: block;
  color: var(--mb-color-text-dark);
  font-weight: bold;
  margin-bottom: 0.125rem;
  word-wrap: break-word;
`;

export const CardDescription = styled(Markdown)`
  display: block;
  color: var(--mb-color-text-dark);
  word-wrap: break-word;
`;

export interface CardCountProps {
  isTopAligned?: boolean;
}

export const CardCount = styled.span<CardCountProps>`
  display: block;
  flex: 0 0 auto;
  color: var(--mb-color-text-dark);
  align-self: ${props => (props.isTopAligned ? "flex-start" : "")};
`;

export const CardMenu = styled.span`
  display: block;
  flex: 0 0 auto;
`;

const getCardRootHoverStyles = (theme: Theme) => css`
  &:hover {
    border-color: ${theme.fn.themeColor("brand")};

    ${CardIcon} {
      color: ${theme.fn.themeColor("brand")};
    }

    ${CardTitle} {
      color: ${theme.fn.themeColor("brand")};
    }
  }
`;

export const CardRoot = styled(Link)`
  display: flex;
  padding: 1.75rem;
  align-items: center;
  border: 1px solid var(--mb-color-border);
  border-radius: 6px;
  cursor: ${props => (props.to ? "pointer" : "default")};

  ${props => props.to && getCardRootHoverStyles(props.theme)}
`;
