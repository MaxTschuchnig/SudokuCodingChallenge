#include <stdio.h>
#include <chrono>
#include <vector>
#include <thread>
#include <fstream>
#include <filesystem>
#include "Field9x9.h"

/// <summary>
/// generates nUnique 9x9 sudokus with less than 30 cues with one unique solution
/// </summary>
/// <param name="nUnique">amount of unique sudokus to be generated</param>
/// <returns>generated sudokus</returns>
std::vector<std::unique_ptr<Field9x9>> GenerateUniqueFields(int nUnique) {
    std::vector<std::unique_ptr<Field9x9>> vec{};
    while (vec.size() < nUnique) {
        std::unique_ptr<Field9x9> field9x9 = std::make_unique<Field9x9>();
        if (field9x9->GetNCues() <= 30) {
            vec.push_back(std::move(field9x9));
        }
    }
    return vec;
}

std::vector<std::unique_ptr<Field9x9>> AdvancedAugmentation(std::vector<std::unique_ptr<Field9x9>>& data) {
    std::vector<std::unique_ptr<Field9x9>> vec{};
    for (const auto& cData : data) {
        // Don't judge me, this is 5min code! I just had to use unique ptr...
        auto leftshift1 = cData->Leftshift();
        auto leftshift2 = cData->Leftshift();
        auto leftshift3 = cData->Leftshift();
        auto rightshift1 = cData->Rightshift();
        auto rightshift2 = cData->Rightshift();
        auto rightshift3 = cData->Rightshift();
        auto downshift1 = cData->Upshift();
        auto downshift2 = cData->Upshift();
        auto downshift3 = cData->Upshift();
        auto upshift1 = cData->Downshift();
        auto upshift2 = cData->Downshift();
        auto upshift3 = cData->Downshift();

        vec.push_back(std::move(leftshift1));
        vec.push_back(std::move(leftshift2));
        vec.push_back(std::move(leftshift3));
        vec.push_back(std::move(rightshift1));
        vec.push_back(std::move(rightshift2));
        vec.push_back(std::move(rightshift3));
        vec.push_back(std::move(downshift1));
        vec.push_back(std::move(downshift2));
        vec.push_back(std::move(downshift3));
        vec.push_back(std::move(upshift1));
        vec.push_back(std::move(upshift2));
        vec.push_back(std::move(upshift3));


        auto leftupshift1 = cData->Leftshift();
        leftupshift1 = leftupshift1->Upshift();
        auto leftupshift2 = cData->Leftshift();
        leftupshift2 = leftupshift1->Upshift();
        auto leftupshift3 = cData->Leftshift();
        leftupshift3 = leftupshift1->Upshift();

        auto leftdownshift1 = cData->Leftshift();
        leftdownshift1 = leftdownshift1->Downshift();
        auto leftdownshift2 = cData->Leftshift();
        leftdownshift2 = leftdownshift2->Downshift();
        auto leftdownshift3 = cData->Leftshift();
        leftdownshift3 = leftdownshift3->Downshift();

        auto rightupshift1 = cData->Leftshift();
        rightupshift1 = rightupshift1->Upshift();
        auto rightupshift2 = cData->Leftshift();
        rightupshift2 = rightupshift2->Upshift();
        auto rightupshift3 = cData->Leftshift();
        rightupshift3 = rightupshift3->Upshift();

        auto rightdownshift1 = cData->Leftshift();
        rightdownshift1 = rightdownshift1->Downshift();
        auto rightdownshift2 = cData->Leftshift();
        rightdownshift2 = rightdownshift2->Downshift();
        auto rightdownshift3 = cData->Leftshift();
        rightdownshift3 = rightdownshift3->Downshift();

        vec.push_back(std::move(leftupshift1));
        vec.push_back(std::move(leftupshift2));
        vec.push_back(std::move(leftupshift3));
        vec.push_back(std::move(leftdownshift1));
        vec.push_back(std::move(leftdownshift2));
        vec.push_back(std::move(leftdownshift3));
        vec.push_back(std::move(rightupshift1));
        vec.push_back(std::move(rightupshift2));
        vec.push_back(std::move(rightupshift3));
        vec.push_back(std::move(rightdownshift1));
        vec.push_back(std::move(rightdownshift2));
        vec.push_back(std::move(rightdownshift3));


        
    }

    return vec;
}

/// <summary>
/// augments the unique sudokus with transpose, rotate and increment, vastly increasing sudoku size
/// </summary>
/// <param name="data">unique sudokus</param>
/// <returns>augmented vector of sudokus</returns>
std::vector<std::unique_ptr<Field9x9>> AugmentData(std::vector<std::unique_ptr<Field9x9>>& data) {
    std::vector<std::unique_ptr<Field9x9>> vec{};
    for (const auto& cData : data) {
        // now listen, i know it looks bad but it is 3 in the morning and it works... 

        // augmentation list. done unoptimal. verrrrry unoptimal
        auto transpose = cData->Transpose();
        auto rot90 = cData->Rotate();
        auto rot180 = rot90->Rotate();
        auto rot270 = rot180->Rotate();
       
        auto inc1 = cData->Increment();
        auto inc1transpose = inc1->Transpose();
        auto inc1rot90 = inc1->Rotate();
        auto inc1rot180 = inc1rot90->Rotate();
        auto inc1rot270 = inc1rot180->Rotate();

        auto inc2 = inc1->Increment();
        auto inc2transpose = inc2->Transpose();
        auto inc2rot90 = inc2->Rotate();
        auto inc2rot180 = inc2rot90->Rotate();
        auto inc2rot270 = inc2rot180->Rotate();

        auto inc3 = inc2->Increment();
        auto inc3transpose = inc3->Transpose();
        auto inc3rot90 = inc3->Rotate();
        auto inc3rot180 = inc3rot90->Rotate();
        auto inc3rot270 = inc3rot180->Rotate();

        auto inc4 = inc3->Increment();
        auto inc4transpose = inc4->Transpose();
        auto inc4rot90 = inc4->Rotate();
        auto inc4rot180 = inc4rot90->Rotate();
        auto inc4rot270 = inc4rot180->Rotate();

        auto inc5 = inc4->Increment();
        auto inc5transpose = inc5->Transpose();
        auto inc5rot90 = inc5->Rotate();
        auto inc5rot180 = inc5rot90->Rotate();
        auto inc5rot270 = inc5rot180->Rotate();

        auto inc6 = inc5->Increment();
        auto inc6transpose = inc6->Transpose();
        auto inc6rot90 = inc6->Rotate();
        auto inc6rot180 = inc6rot90->Rotate();
        auto inc6rot270 = inc6rot180->Rotate();

        auto inc7 = inc6->Increment();
        auto inc7transpose = inc7->Transpose();
        auto inc7rot90 = inc7->Rotate();
        auto inc7rot180 = inc7rot90->Rotate();
        auto inc7rot270 = inc7rot180->Rotate();

        auto inc8 = inc7->Increment();
        auto inc8transpose = inc8->Transpose();
        auto inc8rot90 = inc8->Rotate();
        auto inc8rot180 = inc8rot90->Rotate();
        auto inc8rot270 = inc8rot180->Rotate();

        // i might be going crazy
        vec.push_back(std::move(transpose));
        vec.push_back(std::move(rot90));
        vec.push_back(std::move(rot180));
        vec.push_back(std::move(rot270));
        vec.push_back(std::move(inc1));
        vec.push_back(std::move(inc1transpose));
        vec.push_back(std::move(inc1rot90));
        vec.push_back(std::move(inc1rot180));
        vec.push_back(std::move(inc1rot270));
        vec.push_back(std::move(inc2));
        vec.push_back(std::move(inc2transpose));
        vec.push_back(std::move(inc2rot90));
        vec.push_back(std::move(inc2rot180));
        vec.push_back(std::move(inc2rot270));
        vec.push_back(std::move(inc3));
        vec.push_back(std::move(inc3transpose));
        vec.push_back(std::move(inc3rot90));
        vec.push_back(std::move(inc3rot180));
        vec.push_back(std::move(inc3rot270));
        vec.push_back(std::move(inc4));
        vec.push_back(std::move(inc4transpose));
        vec.push_back(std::move(inc4rot90));
        vec.push_back(std::move(inc4rot180));
        vec.push_back(std::move(inc4rot270));
        vec.push_back(std::move(inc5));
        vec.push_back(std::move(inc5transpose));
        vec.push_back(std::move(inc5rot90));
        vec.push_back(std::move(inc5rot180));
        vec.push_back(std::move(inc5rot270));
        vec.push_back(std::move(inc6));
        vec.push_back(std::move(inc6transpose));
        vec.push_back(std::move(inc6rot90));
        vec.push_back(std::move(inc6rot180));
        vec.push_back(std::move(inc6rot270));
        vec.push_back(std::move(inc7));
        vec.push_back(std::move(inc7transpose));
        vec.push_back(std::move(inc7rot90));
        vec.push_back(std::move(inc7rot180));
        vec.push_back(std::move(inc7rot270));
        vec.push_back(std::move(inc8));
        vec.push_back(std::move(inc8transpose));
        vec.push_back(std::move(inc8rot90));
        vec.push_back(std::move(inc8rot180));
        vec.push_back(std::move(inc8rot270));
    }

    return vec;
}

void VecToJson(const std::vector<std::unique_ptr<Field9x9>>& vec, std::string outpath) {
    std::ofstream file(outpath);
    if (!file.is_open()) {
        std::cerr << "Failed to open the output file: " << outpath << std::endl;
        return;
    }
    file << "["; // Start of the JSON array
    for (size_t i = 0; i < vec.size(); ++i) {
        file << vec[i]->ToJson();
        if (i != vec.size() - 1) {
            file << ",";
        }
    }
    file << "]";
    file.close();
}

std::size_t NumberOfFilesInDirectory(std::filesystem::path path) {
    using std::filesystem::directory_iterator;
    return std::distance(directory_iterator(path), directory_iterator{});
}

void ReadConfig(const std::string& path, int& cId, int& cFileId) {
    std::ifstream file(path);
    std::string line;
    int i = 0;
    while (std::getline(file, line)) {
        if (i == 0) {
            try {
                cId = std::stoi(line);
            }
            catch (std::exception& exc) {
                std::cout << exc.what() << std::endl;
                std::cout << "Using default value for cId = 0" << std::endl;
                cId = 0;
            }
        }
        if (i == 1) {
            try {
                cFileId = std::stoi(line);
            }
            catch (std::exception& exc) {
                std::cout << exc.what() << std::endl;
                std::cout << "Using default value for cFileId = 0" << std::endl;
                cFileId = 0;
            }
        }
        i++;
    }
    file.close();
}

void WriteConfig(const std::string& path, const int& cId, const int& cFileId) {
    std::ofstream file(path);
    file << cId << std::endl;
    file << cFileId << std::endl;
    file.close();
}

int main(int argc, char* argv[]) {
    // 50 * 225 * 5000 = 56.250.000 sudokus (45 through augmentation)
    const int nSudokusPer = 50; // default 50
    int nFiles = 250000; // default 10000
    int sleepTime = 60; // default 600
    int cId = 0, cFileId = 0;
    std::string folderPath = "data";
    std::string config = "config";

    // initial loading of config (if we had an unexpected crash)
    try {
        ReadConfig(config, cId, cFileId);
    }
    catch (std::exception& exc) {
        std::cout << "An error occurred when reading config. If this is the first start, this message cna be ignored." << std::endl;
        std::cout << exc.what() << std::endl;
    }

    // setting id of sudokus
    Field9x9::ProgramId = cId;
    std::cout << "restarted programm with cId: " << cId << ", and cFileId:" << cFileId << std::endl;

    std::filesystem::create_directories(folderPath);

    double time1, time2, time3;
    while (true) {
        if (NumberOfFilesInDirectory(folderPath) < nFiles) {
            time1 = (double)clock() / CLOCKS_PER_SEC;
            // generates new (semi random) sudokus
            std::vector<std::unique_ptr<Field9x9>> vec = GenerateUniqueFields(nSudokusPer);
            time2 = (double)clock() / CLOCKS_PER_SEC;
            // augments sudokus to increase to 225 sudokus for each 1
            auto augmented = std::move(AdvancedAugmentation(vec));
            vec.insert(vec.end(), std::make_move_iterator(augmented.begin()), std::make_move_iterator(augmented.end()));
            augmented = std::move(AugmentData(vec));
            vec.insert(vec.end(), std::make_move_iterator(augmented.begin()), std::make_move_iterator(augmented.end()));
            time3 = (double)clock() / CLOCKS_PER_SEC;
            std::cout << "it took " << time2 - time1 << " to generate unique sudokus and " << time3 - time2 << " to augment them for " << vec.size() << " sudokus" << std::endl;

            VecToJson(vec, folderPath + "/" + std::to_string(cFileId++) + ".json");

            WriteConfig(config, vec[vec.size() - 1]->GetId(), cFileId);
        } else {
            std::cout << "enough files present. sleeping for " << sleepTime << " seconds..." << std::endl;
            std::this_thread::sleep_for(std::chrono::seconds(sleepTime));
        }
    }

    return 0;
}