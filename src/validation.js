const validateChoice = (name, subject, validOptions) => {
  if (subject) {
    const options = validOptions.map(o => o.value);

    if (options.includes(subject)) {
      return subject;
    }

    throw new Error(`"${subject}" is not a valid option for "${name}" (available: ${options.join(', ')})`);
  }

  return null;
};

const validateMultiChoice = (name, subject, validOptions) => {
  if (subject && subject.length !== 0) {
    for (let i = 0; i !== subject.length; ++i) {
      validateChoice(name, subject[i], validOptions);
    }

    return subject;
  }

  return null;
};

module.exports = {
  validateChoice,
  validateMultiChoice,
};
