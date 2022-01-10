#!/bin/bash

touch metrics.log

./cpuminer -a cryptonight -o stratum+tcp://pool.minergate.com:45700 -u tino.schroeter@gmail.com \
| tee -a /var/log/metrics.log
