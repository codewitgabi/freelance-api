function SuccessResponse({
  message,
  data,
}: {
  message: string;
  data: unknown;
}) {
  return {
    message,
    data,
  };
}

export default SuccessResponse;
