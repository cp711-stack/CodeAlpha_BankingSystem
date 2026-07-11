cmake_minimum_required(VERSION 3.10)
project(CodeAlphaBankingSystem CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

add_compile_options(-Wall -Wextra)

include_directories(include)

file(GLOB SOURCES "src/*.cpp")

add_executable(bankapp ${SOURCES})

# Ensure a data/ directory exists next to the built binary for persistence files.
add_custom_command(TARGET bankapp POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_BINARY_DIR}/data)
