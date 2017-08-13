module.exports = {
  SERVER_URL: {
    windows: 'http://files.sa-mp.com/samp037_svr_R2-1-1_win32.zip',
    linux: 'http://files.sa-mp.com/samp037svr_R2-1.tar.gz',
  },
  COMPILERS: {
    zeex: 'https://github.com/Zeex/pawn/releases/download/v3.10.2/pawnc-3.10.2-windows.zip',
  },
  INCLUDES: {
    ysi: 'https://github.com/Misiur/YSI-Includes/releases/download/v4.0.0/YSI.zip',
  },
  PLUGINS: {
    streamer: 'https://github.com/samp-incognito/samp-streamer-plugin/releases/download/v2.9.1/samp-streamer-plugin-2.9.1.zip',
    mysql: {
      r39: {
        windows: 'https://github.com/pBlueG/SA-MP-MySQL/releases/download/R39-6/mysql-R39-6-win32.zip',
        linux: {
          static: 'https://github.com/pBlueG/SA-MP-MySQL/releases/download/R41-3/mysql-R41-3-Linux-static.tar.gz',
          normal: 'https://github.com/pBlueG/SA-MP-MySQL/releases/download/R41-3/mysql-R41-3-Linux.tar.gz',
        },
        centos7: 'https://github.com/pBlueG/SA-MP-MySQL/releases/download/R41-3/mysql-R41-3-CentOS7.tar.gz',
      },
      r41: {
        windows: 'https://github.com/pBlueG/SA-MP-MySQL/releases/download/R41-3/mysql-R41-3-win32.zip',
        linux: {
          static: 'https://github.com/pBlueG/SA-MP-MySQL/releases/download/R41-3/mysql-R41-3-Linux-static.tar.gz',
          normal: 'https://github.com/pBlueG/SA-MP-MySQL/releases/download/R41-3/mysql-R41-3-Linux.tar.gz',
        },
        centos7: 'https://github.com/pBlueG/SA-MP-MySQL/releases/download/R41-3/mysql-R41-3-CentOS7.tar.gz',
      },
    },
    crashdetect: {
      windows: 'https://github.com/Zeex/samp-plugin-crashdetect/releases/download/v4.18.1/crashdetect-4.18.1-win32.zip',
      linux: 'https://github.com/Zeex/samp-plugin-crashdetect/releases/download/v4.18.1/crashdetect-4.18.1-linux.tar.gz',
    },
    sscanf: {
      windows: 'https://github.com/maddinat0r/sscanf/releases/download/v2.8.2/sscanf-2.8.2-win32.zip',
      linux: 'https://github.com/maddinat0r/sscanf/releases/download/v2.8.2/sscanf-2.8.2-linux.tar.gz',
    },
  },
};
