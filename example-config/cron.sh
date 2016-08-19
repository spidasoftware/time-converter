#!/bin/bash
#
#  Put the following in a crontab:
#
# SHELL=/bin/bash
#
# * 13 * * 2 $HOME/.timeConvert/cron.sh > $HOME/.timeConvert/stdout.log 2> $HOME/.timeConvert/stderr.log
#
# Modify the following paths if needed.
#
source $HOME/.bash_profile
pushd $HOME/time-converter
  npm start
popd
