
const AxiosError = require('axios-error');

module.exports = (RetryEnabledApiStamp, AccessTokensGetterStamp) => {
  const RecordingApiStamp = RetryEnabledApiStamp.compose(AccessTokensGetterStamp, {
    props: {
      baseRecordingsPath: '/recordings',
    },

    methods: {
      async getRecordings(recordingsCallParams) {
        try {
          const response = await this.get(
            this.baseRecordingsPath,
            { params: recordingsCallParams }
          );

          return response.data;
        } catch (error) {
          throw this.createFormattedGetRecordingsError(error);
        }
      },

      createFormattedGetRecordingsError(error) {
        if (error.response) {
          return new AxiosError(error.response.data.error.message, error);
        }
        return error;
      },
    },
  });
  return RecordingApiStamp;
};
