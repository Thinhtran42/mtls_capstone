import { Box, Typography } from "@mui/material";

const ReadingContent = ({ content }) => {
  if (!content || content.length === 0) {
    return <Typography>There is no content in this section.</Typography>;
  }

  return content.map((item, index) => (
    <Box
      key={index}
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {item.type === "text" ? (
        <Typography
          sx={{
            fontSize: "1.1rem",
            lineHeight: 1.6,
            maxWidth: "800px",
            width: "100%",
          }}
        >
          {item.data}
        </Typography>
      ) : item.type === "image" ? (
        <Box
          sx={{
            maxWidth: "800px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <img
            src={item.data}
            alt={item.caption || "Lesson image"}
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "8px",
            }}
          />
          {item.caption && (
            <Typography sx={{ mt: 1, color: "#666", fontSize: "0.9rem" }}>
              {item.caption}
            </Typography>
          )}
        </Box>
      ) : null}
    </Box>
  ));
};

export default ReadingContent; 