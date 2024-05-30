import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { color } from "metabase/lib/colors";

export const MembershipSelectContainer = styled.ul`
  padding: 0.5rem 0;
  width: 300px;
  max-height: 600px;
`;

interface MembershipSelectItemProps {
  isDisabled?: boolean;
}

export const MembershipSelectItem = styled.li<MembershipSelectItemProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: ${props => (props.isDisabled ? "unset" : "pointer")};
  padding: 0.5rem 1.5rem;
  background-color: var(--mb-color-bg-white);
  color: var(--mb-color-text-medium);
  font-weight: 700;

  ${({ isDisabled, theme }) =>
    !isDisabled &&
    css`
      &:hover {
        color: var(--mb-color-text-white);
        background-color: ${theme.fn.themeColor("filter")};

        .Icon {
          color: var(--mb-color-text-white) !important;
        }
      }
    `}
`;

export const MembershipSelectHeader = styled.li`
  padding: 0.75rem 1.5rem 0.5rem 1.5rem;
  font-size: 12px;
  font-weight: 800;
  color: var(--mb-color-filter);
`;

export const MembershipActionsContainer = styled.div`
  padding-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
