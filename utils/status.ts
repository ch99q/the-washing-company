const statuses = {
  200: "The process is operational, and everything is ready.",
  202: "The wash is already started."
};

const exceptions = {
  400: "Invalid arguments for requested function.",
  401: "Unable to perform action, permission denied!",
  404: "Unable to find the expected wash.",
  405: "Wash with same address already exists.",
  406: "Problem occurred when trying to connect to database.",
  407: "Unable to start or stop wash, due to fatal error.",
  500: "The process has caught en fatal error, service is required.",
  501: "A non-fatal error was caught, abort or contact service to fix issue.",
  601: "Invalid payment card, please try another.",
  602: "Insufficient funds, unable to transfer funds.",
};

export default function status(
  code: keyof (typeof statuses & typeof exceptions)
) {
  if (statuses[code])
    return {
      status: { code, message: statuses[code] },
    };

  return { error: { code, message: exceptions[code] } };
}
