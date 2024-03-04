import styled from "@emotion/styled";
import Typography from "@mui/material/Typography";

const StyledTypography = styled(Typography)({
  fontWeight: 600,
  backgroundImage: "linear-gradient(to left, #553c9a, #b393d3)",
  color: "transparent",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  textAlign: "center",
});
export const FancyDefaultTitle = (props: any) => (
  <StyledTypography {...props} />
);
